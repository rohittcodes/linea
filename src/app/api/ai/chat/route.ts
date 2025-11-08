import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, tool, type UIMessage, generateText } from "ai"
import { z } from "zod"

export const maxDuration = 30
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  const cookie = req.headers.get('cookie') || ''
  try {
    console.log('[ai-chat] incoming messages count=', messages?.length || 0)
    if (messages && messages.length > 0) {
      const last = messages[messages.length - 1]
      console.log('[ai-chat] last user msg role=', last.role, 'len=', (last as any)?.content?.length || (last as any)?.parts?.length)
    }

    // Normalize and clean messages: convert content to parts, filter invalid messages
    const cleanedMessages = (messages || [])
      .map((m: any) => {
        // Normalize: if message has 'content' array but no 'parts', convert it
        if (m.content && Array.isArray(m.content) && !m.parts) {
          return { ...m, parts: m.content }
        }
        return m
      })
      .map((m: any) => {
        // Clean parts: remove invalid parts from each message
        const parts = m.parts || m.content || []
        if (!Array.isArray(parts)) return null
        
        const validParts = parts.filter((p: any) => {
          if (!p || !p.type) return false
          
          if (p.type === 'text') {
            return typeof p.text === 'string' && p.text.length > 0
          }
          
          if (p.type === 'tool-call') {
            return p.toolCallId && p.toolName && (p.args !== undefined || p.input !== undefined)
          }
          
          if (p.type === 'tool-result') {
            return p.toolCallId && p.output !== undefined
          }
          
          // Skip unknown part types
          return false
        })
        
        if (validParts.length === 0) return null
        
        return { ...m, parts: validParts }
      })
      .filter((m: any) => m !== null && m.parts && m.parts.length > 0)

  const result = streamText({
    model: google('gemini-2.0-flash') as any,
    system: `You are Linea's AI assistant. Be concise and helpful.
    
CRITICAL: After executing any tool, you MUST ALWAYS generate a natural language response that explains the result to the user. Never return only the raw tool output - always provide a conversational summary.

For example:
- Tool returns invoice data → You respond: "Your last invoice (INV-123) for Client Name is ₹500.00 and is currently SENT. Issued on [date], due on [date]."
- Tool returns list → You respond: "I found X invoices..." etc.

After tool execution, continue generating text to explain the results to the user.`,
    messages: convertToModelMessages(cleanedMessages),
    // The SDK automatically handles multiple tool calls and text generation after tools
    tools: {
      // Agent: Provisional IRN operations
      registerProvisionalIRN: tool({
        description: 'Generate a provisional IRN for an invoice (demo mode)',
        inputSchema: z.object({ invoiceId: z.string() }),
        execute: async ({ invoiceId }) => {
          console.log('[ai-chat][tool] registerProvisionalIRN start invoiceId=', invoiceId)
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/einvoicing/demo/register/${invoiceId}`, { method: 'POST', headers: { cookie } })
          const data = await res.json()
          console.log('[ai-chat][tool] registerProvisionalIRN status=', res.status, 'ok=', res.ok)
          if (!res.ok) throw new Error(data?.message || data?.error || 'provisional_irn_failed')
          return { demoIrn: data.demoIrn }
        },
      }),
      saveOfficialIRN: tool({
        description: 'Save the official IRN for an invoice',
        inputSchema: z.object({ invoiceId: z.string(), irn: z.string() }),
        execute: async ({ invoiceId, irn }) => {
          console.log('[ai-chat][tool] saveOfficialIRN start invoiceId=', invoiceId)
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/einvoicing/manual/${invoiceId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ irn })
          })
          const data = await res.json()
          console.log('[ai-chat][tool] saveOfficialIRN status=', res.status, 'ok=', res.ok)
          if (!res.ok) throw new Error(data?.message || data?.error || 'manual_irn_failed')
          return { ok: true }
        },
      }),
      // Agent: Invoice search helper (relies on existing invoices API)
      listInvoices: tool({
        description: 'List invoices (first page)',
        inputSchema: z.object({}),
        execute: async () => {
          console.log('[ai-chat][tool] listInvoices start')
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { headers: { cookie } })
          console.log('[ai-chat][tool] listInvoices status=', res.status, 'ok=', res.ok)
          if (!res.ok) {
            const err = await res.text().catch(() => '')
            return { success: false, error: 'invoices_unavailable', message: err || `status_${res.status}` }
          }
          const data = await res.json().catch(() => ({}))
          return data
        },
      }),
      getLastInvoiceId: tool({
        description: 'Return the most recently created invoice id (for current user).',
        inputSchema: z.object({}),
        execute: async () => {
          console.log('[ai-chat][tool] getLastInvoiceId start')
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { headers: { cookie } })
          console.log('[ai-chat][tool] getLastInvoiceId status=', res.status, 'ok=', res.ok)
          if (!res.ok) {
            const err = await res.text().catch(() => '')
            return { found: false, error: 'invoices_unavailable', message: err || `status_${res.status}` }
          }
          const data = await res.json().catch(() => ({}))
          const invoices = data?.data?.invoices || []
          // API returns createdAt desc; pick first
          if (invoices.length === 0) return { found: false }
          const first = invoices[0]
          return { found: true, id: first.id, status: first.status, invoiceNumber: first.invoiceNumber }
        },
      }),
      summarizeInvoices: tool({
        description: 'Summarize invoices by simple criteria (status/minAmount)',
        inputSchema: z.object({ status: z.string().optional(), minAmount: z.number().optional() }),
        execute: async ({ status, minAmount }) => {
          console.log('[ai-chat][tool] summarizeInvoices start status=', status, 'minAmount=', minAmount)
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { headers: { cookie } })
          console.log('[ai-chat][tool] summarizeInvoices status=', res.status, 'ok=', res.ok)
          const api = await res.json().catch(() => ({}))
          const list = api?.data?.invoices || []
          const filtered = list.filter((inv: any) => (
            (status ? inv.status === status : true) && (minAmount ? Number(inv.total) >= minAmount : true)
          ))
          const top = filtered.slice(0, 10).map((i: any) => ({ id: i.id, number: i.invoiceNumber, total: i.total, status: i.status }))
          return { count: filtered.length, top }
        },
      }),
      updateInvoiceStatus: tool({
        description: 'Update an invoice status (e.g., mark PAID, SENT, OVERDUE).',
        inputSchema: z.object({
          invoiceId: z.string(),
          status: z.enum(['DRAFT','SENT','VIEWED','PAID','OVERDUE','CANCELLED','REFUNDED'])
        }),
        execute: async ({ invoiceId, status }) => {
          console.log('[ai-chat][tool] updateInvoiceStatus start', invoiceId, status)
          let targetId = invoiceId
          // If the reference looks like an invoiceNumber (e.g., INV-XXXX), resolve to actual ID
          try {
            if (/^INV[-_]/i.test(invoiceId) || invoiceId.length < 20) {
              const listRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { headers: { cookie } })
              const listJson = await listRes.json().catch(() => ({}))
              const invoices = listJson?.data?.invoices || []
              const match = invoices.find((i: any) => i.invoiceNumber === invoiceId || i.id === invoiceId)
              if (match?.id) {
                targetId = match.id
                console.log('[ai-chat][tool] resolved invoice ref -> id', invoiceId, '->', targetId)
              }
            }
          } catch (e) {
            console.log('[ai-chat][tool] resolution skipped', e)
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices/${targetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', cookie },
            body: JSON.stringify({ status })
          })
          const data = await res.json().catch(() => ({}))
          console.log('[ai-chat][tool] updateInvoiceStatus status=', res.status, 'ok=', res.ok)
          if (!res.ok) throw new Error(data?.message || data?.error || 'update_status_failed')
          return { success: true, invoiceId: targetId, status }
        }
      }),
      suggestReminders: tool({
        description: 'Suggest reminder dates and an email draft for an invoice',
        inputSchema: z.object({
          invoiceId: z.string(),
          tone: z.enum(['friendly','formal']).optional()
        }),
        execute: async ({ invoiceId, tone = 'friendly' }) => {
          console.log('[ai-chat][tool] suggestReminders start invoiceId=', invoiceId)
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices/${invoiceId}`, { headers: { cookie } })
          console.log('[ai-chat][tool] suggestReminders status=', res.status, 'ok=', res.ok)
          const inv = await res.json().catch(() => ({}))
          const invoice = inv?.data || inv
          const due = invoice?.dueDate ? new Date(invoice.dueDate) : null
          const today = new Date()
          const dates: string[] = []
          if (due) {
            const d1 = new Date(due); d1.setDate(d1.getDate() - 3); if (d1 > today) dates.push(d1.toISOString().slice(0,10))
            const d2 = new Date(due); dates.push(d2.toISOString().slice(0,10))
            const d3 = new Date(due); d3.setDate(d3.getDate() + 7); dates.push(d3.toISOString().slice(0,10))
          }
          const customer = invoice?.client?.name || 'Customer'
          const amount = typeof invoice?.total !== 'undefined' ? Number(invoice.total).toFixed(2) : ''
          const emailDraft = tone === 'formal'
            ? `Subject: Payment Reminder for Invoice ${invoice?.invoiceNumber}\n\nDear ${customer},\n\nThis is a gentle reminder that invoice ${invoice?.invoiceNumber} amounting to ₹${amount} is due on ${due ? due.toDateString() : 'N/A'}.\nKindly let us know if you have any questions.\n\nRegards,\nAccounts`
            : `Hi ${customer}, a quick reminder for invoice ${invoice?.invoiceNumber} (₹${amount}) due on ${due ? due.toDateString() : 'N/A'}. Thanks!`
          return { dates, emailDraft }
        },
      }),
      improveOrTranslate: tool({
        description: 'Polish or translate line item descriptions',
        inputSchema: z.object({ text: z.string(), targetLang: z.string().optional() }),
        execute: async ({ text, targetLang }) => {
          const prompt = targetLang
            ? `Translate to ${targetLang} and lightly improve clarity:\n\n${text}`
            : `Improve clarity, grammar, and conciseness:\n\n${text}`
          console.log('[ai-chat][tool] improveOrTranslate start lang=', targetLang)
          const out = await generateText({ model: google('gemini-2.0-flash') as any, prompt })
          return { result: (out as any).text }
        },
      }),
      summarizeLastInvoice: tool({
        description: 'Fetch the most recent invoice and return detailed invoice information including invoice number, client name, status, total amount, issue date, and due date. After calling this tool, always provide a clear natural language response to the user explaining the invoice details.',
        inputSchema: z.object({}),
        execute: async () => {
          console.log('[ai-chat][tool] summarizeLastInvoice start')
          const invRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/invoices`, { headers: { cookie } })
          console.log('[ai-chat][tool] summarizeLastInvoice list status=', invRes.status, 'ok=', invRes.ok)
          if (!invRes.ok) {
            const err = await invRes.text().catch(() => '')
            return { ok: false, error: 'invoices_unavailable', message: err || `status_${invRes.status}` }
          }
          const invData = await invRes.json().catch(() => ({}))
          const invoices = invData?.data?.invoices || []
          if (!invoices.length) return { ok: false, error: 'no_invoices' }
          const i = invoices[0]
          
          // Format dates
          const issueDate = i.issueDate ? new Date(i.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
          const dueDate = i.dueDate ? new Date(i.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
          const total = typeof i.total !== 'undefined' ? `₹${Number(i.total).toFixed(2)}` : '₹0.00'
          const client = i.client?.name || 'Client'
          
          // Return data with a suggested response format
          return {
            ok: true,
            invoiceId: i.id,
            invoiceNumber: i.invoiceNumber,
            status: i.status,
            total: i.total,
            client,
            issueDate: i.issueDate ? new Date(i.issueDate).toISOString().slice(0,10) : null,
            dueDate: i.dueDate ? new Date(i.dueDate).toISOString().slice(0,10) : null,
            // Add formatted response hint
            formattedResponse: `Your last invoice ${i.invoiceNumber || i.id} for ${client} is ${total} and is currently ${i.status}. It was issued on ${issueDate} and is due on ${dueDate}.`,
          }
        },
      }),
    },
  })

  console.log('[ai-chat] stream ready (ai)')

  try {
    // Get the base stream response
    const baseResponse = result.toUIMessageStreamResponse()
    
    // Create a wrapper stream that checks for text after tools and generates follow-up if needed
    const reader = baseResponse.body?.getReader()
    if (!reader) {
      return baseResponse
    }

    const encoder = new TextEncoder()
    let streamBuffer = ''
    let hasTextInStream = false
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // First, pass through the original stream
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            // Check if this chunk contains text
            const decoder = new TextDecoder()
            const chunkText = decoder.decode(value, { stream: true })
            streamBuffer += chunkText
            
            // Look for text parts in the stream
            if (chunkText.includes('"type":"text"') || chunkText.includes('"text"')) {
              hasTextInStream = true
            }
            
            controller.enqueue(value)
          }
          
          // Wait a bit for stream to fully complete
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check if we need a follow-up
          const finalText = await result.text.catch(() => '')
          const steps = await result.steps.catch(() => [])
          
          const hasToolCall = Array.isArray(steps) && steps.some((step: any) => step.toolCalls?.length > 0)
          const hasText = hasTextInStream || (finalText && finalText.trim().length > 0)
          
          console.log('[ai-chat] stream complete - hasToolCall:', hasToolCall, 'hasText:', hasText, 'finalText length:', finalText?.length || 0)
          
          // If tools were called but no text was generated, create a follow-up response
          if (hasToolCall && !hasText) {
            console.log('[ai-chat] generating follow-up text response')
            
            // Extract tool result - try multiple sources
            let toolResult: any = null
            
            // Method 1: Try extracting from steps
            for (const step of steps as any[]) {
              if (step.toolCalls) {
                for (const tc of step.toolCalls as any[]) {
                  const result = (tc as any).result
                  if (result && typeof result === 'object' && ('status' in result || 'invoiceNumber' in result || 'ok' in result)) {
                    toolResult = result
                    console.log('[ai-chat] extracted toolResult from steps')
                    break
                  }
                }
                if (toolResult) break
              }
            }
            
            // Method 2: If still no result, parse from streamBuffer - use a more reliable approach
            if (!toolResult || Object.keys(toolResult).length === 0) {
              try {
                // Look for the output object - find the start and extract complete JSON
                const outputStart = streamBuffer.indexOf('"output":')
                if (outputStart >= 0) {
                  // Find the opening brace after "output":
                  let jsonStart = outputStart + '"output":'.length
                  while (jsonStart < streamBuffer.length && streamBuffer[jsonStart].match(/\s/)) {
                    jsonStart++
                  }
                  
                  if (streamBuffer[jsonStart] === '{') {
                    // Extract complete JSON object by counting braces
                    let braceCount = 0
                    let jsonEnd = jsonStart
                    for (let i = jsonStart; i < streamBuffer.length; i++) {
                      if (streamBuffer[i] === '{') braceCount++
                      if (streamBuffer[i] === '}') {
                        braceCount--
                        if (braceCount === 0) {
                          jsonEnd = i + 1
                          break
                        }
                      }
                    }
                    if (jsonEnd > jsonStart) {
                      const jsonStr = streamBuffer.substring(jsonStart, jsonEnd)
                      toolResult = JSON.parse(jsonStr)
                      console.log('[ai-chat] extracted toolResult from streamBuffer (brace counting)')
                    }
                  }
                }
              } catch (e) {
                console.log('[ai-chat] streamBuffer parse error:', e)
              }
            }
            
            console.log('[ai-chat] FINAL toolResult:', JSON.stringify(toolResult, null, 2))
            
            if (!toolResult || Object.keys(toolResult).length === 0) {
              console.error('[ai-chat] ERROR: Could not extract tool result from any source!')
              controller.close()
              return
            }
            
            // Get the user's query
            const lastUserMessage = cleanedMessages[cleanedMessages.length - 1]
            const userQuery = lastUserMessage?.parts?.find((p: any) => p.type === 'text')?.text || 
                             (typeof lastUserMessage?.content === 'string' ? lastUserMessage.content : '')
            
            const status = String((toolResult as any).status || '')
            const invoiceNumber = String((toolResult as any).invoiceNumber || '')
            const total = String((toolResult as any).total || '0')
            const client = String((toolResult as any).client || 'Client')
            const issueDate = (toolResult as any).issueDate
            const dueDate = (toolResult as any).dueDate
            
            console.log('[ai-chat] extracted values:', { status, invoiceNumber, total, client, issueDate, dueDate })
            
            // Format dates
            let issueDateFormatted = ''
            let dueDateFormatted = ''
            if (issueDate) {
              try {
                issueDateFormatted = new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              } catch (e) {
                issueDateFormatted = issueDate
              }
            }
            if (dueDate) {
              try {
                dueDateFormatted = new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              } catch (e) {
                dueDateFormatted = dueDate
              }
            }
            
            const totalFormatted = `₹${Number(total).toFixed(2)}`
            
            // Answer the user's question directly based on tool results
            const isPaidQuestion = /paid|payment|payout/i.test(userQuery)
            const isStatusQuestion = /status|state|current/i.test(userQuery)
            
            let directAnswer = ''
            
            if (isPaidQuestion) {
              const isPaid = status === 'PAID'
              directAnswer = isPaid 
                ? `Yes, the invoice ${invoiceNumber} for ${client} (${totalFormatted}) is PAID.`
                : `No, the invoice ${invoiceNumber} for ${client} (${totalFormatted}) is not paid. The current status is ${status}.`
              
              if (issueDateFormatted && dueDateFormatted) {
                directAnswer += ` It was issued on ${issueDateFormatted} and is due on ${dueDateFormatted}.`
              }
            } else if (isStatusQuestion) {
              directAnswer = `The invoice ${invoiceNumber} for ${client} has a status of ${status} and a total of ${totalFormatted}.`
              if (issueDateFormatted && dueDateFormatted) {
                directAnswer += ` It was issued on ${issueDateFormatted} and is due on ${dueDateFormatted}.`
              }
            } else {
              // For other questions, provide complete info
              directAnswer = `The invoice ${invoiceNumber} for ${client} is ${totalFormatted} and is currently ${status}.`
              if (issueDateFormatted && dueDateFormatted) {
                directAnswer += ` It was issued on ${issueDateFormatted} and is due on ${dueDateFormatted}.`
              }
            }
            
            // Pass the tool result data directly to the model and ask it to answer
            // This is what the user requested - "recall the AI model with the response"
            console.log('[ai-chat] finalAnswer being sent to model:', directAnswer)
            console.log('[ai-chat] toolResult data:', JSON.stringify(toolResult, null, 2))
            
            // Include the complete tool result in the prompt so model can see all the data
            const followUpResult = await streamText({
              model: google('gemini-2.0-flash') as any,
              system: 'You are Linea\'s AI assistant. Answer questions about invoices using ONLY the data provided. Use the exact values from the invoice data.',
              prompt: `The user asked: "${userQuery}"

Invoice data from tool execution:
${JSON.stringify(toolResult, null, 2)}

Based on this invoice data, answer the user's question "${userQuery}". 
- Use the exact status value: "${status}"
- Use the exact amount: ${totalFormatted}
- Use the exact invoice number: "${invoiceNumber}"
- Use the exact client name: "${client}"
${issueDateFormatted ? `- Issue date: ${issueDateFormatted}` : ''}
${dueDateFormatted ? `- Due date: ${dueDateFormatted}` : ''}

Provide a clear, direct answer using these exact values.`,
            })
            
            // Stream the follow-up response
            const followUpResponse = followUpResult.toUIMessageStreamResponse()
            const followUpReader = followUpResponse.body?.getReader()
            
            if (followUpReader) {
              // Stream the follow-up response - it should continue in the same message
              while (true) {
                const { done, value } = await followUpReader.read()
                if (done) break
                controller.enqueue(value)
              }
            }
          }
          
          controller.close()
        } catch (error) {
          console.error('[ai-chat] stream wrapper error:', error)
          controller.error(error)
        }
      }
    })
    
    return new Response(stream, {
      headers: baseResponse.headers,
      status: baseResponse.status,
    })
  } catch (responseErr: any) {
    console.error('[ai-chat] toUIMessageStreamResponse error:', responseErr)
    // Fallback to simple response
    return result.toUIMessageStreamResponse()
  }
  } catch (e: any) {
    console.error('[ai-chat] error', e)
    return new Response(JSON.stringify({ error: 'ai_chat_failed', message: String(e?.message || e) }), { status: 500 })
  }
}


