"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function fetchWorkspaces() {
  const response = await fetch('/api/workspaces');
  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }
  const data = await response.json();
  return data.data || [];
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: fetchWorkspaces,
    enabled: !!session, // Only fetch when session is available
    retry: 1,
  });

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      const activeWorkspace = workspaces.find((w: any) => w.isActive) || workspaces[0];
      if (activeWorkspace) {
        router.replace(`/${activeWorkspace.id}/dashboard`);
      } else {
        router.replace('/setup');
      }
    } else if (!isLoading && (error || !workspaces)) {
      // Only redirect to setup if we're done loading and there's an error or no workspaces
      router.replace('/setup');
    }
  }, [workspaces, isLoading, error, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Skeleton className="h-2 w-2 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <Skeleton className="h-4 w-40 mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
