"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, MessageCircle, Send, Loader2 } from "lucide-react";
import { MessageShimmer, ToolExecutingShimmer, ThinkingShimmer } from "./MessageShimmer";

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  
  // Use DefaultChatTransport without custom fetch - let it handle parsing
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
    onError: (error) => {
      console.error('[ChatDock] useChat error:', error);
      console.error('[ChatDock] error message:', error?.message);
      console.error('[ChatDock] error stack:', error?.stack);
      if (error instanceof Error) {
        console.error('[ChatDock] error name:', error.name);
        console.error('[ChatDock] error cause:', error.cause);
      }
    },
  });
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Debug: Log messages and status changes
  useEffect(() => {
    console.log('[ChatDock] messages changed:', messages.length, 'status:', status);
    if (messages.length > 0) {
      console.log('[ChatDock] last message:', messages[messages.length - 1]);
    }
  }, [messages, status]);

  useEffect(() => {
    if (error) {
      console.error('[ChatDock] error state:', error);
    }
  }, [error]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const getMessageText = (m: any) => {
    // Extract text from message parts - check all part types
    if (m?.parts && Array.isArray(m.parts)) {
      // Get all text parts regardless of state (streaming or done)
      const textParts = m.parts
        .filter((p: any) => {
          // Include any part with type 'text' that has text content
          return p.type === 'text' && (p.text || p.content)
        })
        .map((p: any) => {
          // Extract text from the part
          const text = p.text || p.content || ''
          return typeof text === 'string' ? text : String(text)
        })
        .filter((t: string) => t && t.trim().length > 0)
      
      return textParts.length > 0 ? textParts.join('') : null
    }
    
    // Fallback for older format
    const c = m?.content
    if (typeof c === 'string') return c
    if (Array.isArray(c)) {
      return c.map((p: any) => (p?.type === 'text' ? (p.text || p.content || '') : '')).join('')
    }
    
    return null
  }

  const hasToolCalls = (m: any) => {
    if (m?.parts && Array.isArray(m.parts)) {
      return m.parts.some((p: any) => p.type === 'tool-call')
    }
    return false
  }

  const renderMarkdownString = (text: string) => {
    // Minimal markdown: code fences, inline code, bold, italics, line breaks, lists
    const lines = text.split(/\n/);
    const elements: React.ReactNode[] = [];
    let inCode = false;
    let codeBuffer: string[] = [];
    lines.forEach((line, i) => {
      if (line.trim().startsWith('```')) {
        if (!inCode) {
          inCode = true;
          codeBuffer = [];
        } else {
          inCode = false;
          elements.push(
            <pre key={`pre-${i}`} className="bg-gray-50 border rounded p-2 overflow-x-auto text-xs">
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
        }
        return;
      }
      if (inCode) {
        codeBuffer.push(line);
        return;
      }
      // Lists
      if (/^\s*[-*]\s+/.test(line)) {
        elements.push(
          <div key={`li-${i}`} className="ml-4 list-disc">
            <li dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.replace(/^\s*[-*]\s+/, '')) }} />
          </div>
        );
        return;
      }
      // Paragraph
      elements.push(
        <p key={`p-${i}`} className="mb-1" dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
      );
    });
    // If code fence never closed, flush
    if (inCode && codeBuffer.length) {
      elements.push(
        <pre key={`pre-end`} className="bg-gray-50 border rounded p-2 overflow-x-auto text-xs">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }
    return <div className="prose prose-sm max-w-none">{elements}</div>;
  };

  const inlineMarkdown = (s: string) => {
    // Replace special chars minimally
    let html = s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // italics
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return html;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <Card className="w-[360px] h-[520px] shadow-xl border border-gray-200">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Linea AI</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 h-[440px] flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto border rounded-md p-3 bg-white">
              {messages.length === 0 ? (
                <div className="text-xs text-gray-500">Ask about invoices, GST, or IRN demo…</div>
              ) : (
                messages.map((m) => {
                  const isCurrentMessageStreaming = m.role === 'assistant' && (status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.id === m.id;
                  const text = getMessageText(m as any)
                  const hasText = text && text.trim().length > 0
                  const showingTools = hasToolCalls(m as any)
                  
                  return (
                    <div key={m.id} className="text-sm mb-2">
                      {hasText ? (
                        <>
                          <span className="font-medium mr-2">{m.role === "user" ? "You" : "AI"}:</span>
                          {renderMarkdownString(text)}
                        </>
                      ) : isCurrentMessageStreaming && showingTools ? (
                        <ToolExecutingShimmer />
                      ) : isCurrentMessageStreaming ? (
                        <ThinkingShimmer />
                      ) : m.role === 'assistant' ? (
                        <details className="text-xs text-gray-500">
                          <summary>No text (debug)</summary>
                          <pre className="whitespace-pre-wrap break-words text-xs max-h-40 overflow-auto">{JSON.stringify(m, null, 2)}</pre>
                        </details>
                      ) : (
                        <>
                          <span className="font-medium mr-2">{m.role === "user" ? "You" : "AI"}:</span>
                        </>
                      )}
                    </div>
                  )
                })
              )}
              {error && (
                <div className="text-xs text-red-600">{String(error)}</div>
              )}
            </div>
            <form className="mt-2 flex gap-2" onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && status === 'ready') {
                sendMessage({ text: input });
                setInput('');
              }
            }}>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== 'ready'}
                placeholder="e.g., list last 5 PAID invoices"
              />
              <Button type="submit" disabled={status !== 'ready'} className="min-w-[80px]">
                {status !== 'ready' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </>
                )}
              </Button>
              {(status === 'submitted' || status === 'streaming') && (
                <Button type="button" variant="secondary" onClick={() => stop()}>Stop</Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}


