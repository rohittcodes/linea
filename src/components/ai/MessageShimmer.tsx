import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export function MessageShimmer() {
  return (
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-4 w-12 flex-shrink-0" /> {/* "AI:" label */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  )
}

export function ToolExecutingShimmer() {
  return (
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-4 w-12 flex-shrink-0" /> {/* "AI:" label */}
      <div className="flex-1 flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function ThinkingShimmer() {
  return (
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-4 w-12 flex-shrink-0" /> {/* "AI:" label */}
      <div className="flex-1 flex items-center gap-1">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

export function StreamingMessageShimmer() {
  return (
    <div className="flex gap-2 mb-2">
      <Skeleton className="h-4 w-12 flex-shrink-0" /> {/* "AI:" label */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
