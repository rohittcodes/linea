"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const redirectToWorkspace = async () => {
      try {
        // Get user's active workspace
        const response = await fetch('/api/workspaces');
        if (response.ok) {
          const data = await response.json();
          const activeWorkspace = data.data?.find((w: any) => w.isActive) || data.data?.[0];
          
          if (activeWorkspace) {
            router.replace(`/${activeWorkspace.id}/dashboard`);
          } else {
            // No workspace found, redirect to workspace setup
            router.replace('/setup');
          }
        } else {
          // API error, redirect to workspace setup
          router.replace('/setup');
        }
      } catch (error) {
        console.error('Error fetching workspace:', error);
        router.replace('/setup');
      }
    };

    if (session) {
      redirectToWorkspace();
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center space-x-2">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Redirecting to workspace...</span>
      </div>
    </div>
  );
}
