"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  ChevronDown,
  Plus,
  Settings,
  Users,
  Loader2,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  type: "PERSONAL" | "TEAM" | "ENTERPRISE";
  avatar?: string;
  memberCount?: number;
  isActive: boolean;
  subscriptionStatus: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
}

async function fetchWorkspacesData() {
  const response = await fetch('/api/workspaces');
  if (!response.ok) {
    throw new Error('Failed to fetch workspaces');
  }
  const data = await response.json();
  return data.data || [];
}

async function createDefaultWorkspace() {
  const response = await fetch('/api/seed-workspace', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create default workspace');
  }
}

export function WorkspaceSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: workspaces = [], isLoading: loading, error } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const data = await fetchWorkspacesData();
      if (data.length === 0) {
        // Create default workspace if none exists
        await createDefaultWorkspace();
        // Fetch again after creation
        return await fetchWorkspacesData();
      }
      return data;
    },
    retry: 1,
    // Fallback data if API fails
    placeholderData: [{
      id: "default",
      name: "Personal Workspace",
      type: "PERSONAL" as const,
      isActive: true,
      subscriptionStatus: "FREE" as const
    }],
  });

  const activeWorkspace = workspaces.find(w => w.isActive) || workspaces[0];

  const switchWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetch(`/api/workspaces/${workspaceId}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to switch workspace');
      }

      // Invalidate and refetch workspaces
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      
      // Navigate to the workspace-specific dashboard
      router.push(`/${workspaceId}/dashboard`);
    },
  });

  const switchWorkspace = async (workspaceId: string) => {
    try {
      await switchWorkspaceMutation.mutateAsync(workspaceId);
    } catch (err) {
      console.error('Error switching workspace:', err);
    }
  };

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case "TEAM":
        return <Users className="w-4 h-4" />;
      case "ENTERPRISE":
        return <Building2 className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getWorkspaceTypeLabel = (type: string) => {
    switch (type) {
      case "TEAM":
        return "Team";
      case "ENTERPRISE":
        return "Enterprise";
      default:
        return "Personal";
    }
  };

  const handleCreateWorkspace = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['workspaces'] }); // Refresh the workspaces list
  };

  if (loading) {
    return (
      <Button variant="ghost" className="w-full justify-between px-2 py-2 h-auto" disabled>
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </Button>
    );
  }



  if (!activeWorkspace) {
    return (
      <Button variant="ghost" className="w-full justify-between px-2 py-2 h-auto" disabled>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">No workspace</span>
        </div>
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-2 py-2 h-auto group-data-[collapsible=icon]:justify-center"
            title={activeWorkspace.name}
          >
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-[#2388ff] text-white">
                  {getWorkspaceIcon(activeWorkspace.type)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate w-full max-w-[140px]">
                  {activeWorkspace.name}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0 group-data-[collapsible=icon]:hidden" />
          </Button>
        </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start" side="bottom">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Workspaces</p>
              <p className="text-xs leading-none text-muted-foreground">
                Switch between your workspaces
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => switchWorkspace(workspace.id)}
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-[#2388ff] text-white">
                  {getWorkspaceIcon(workspace.type)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-medium truncate">
                  {workspace.name}
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs h-3 px-1">
                    {getWorkspaceTypeLabel(workspace.type)}
                  </Badge>
                  {workspace.memberCount && (
                    <span className="text-xs text-muted-foreground">
                      {workspace.memberCount} members
                    </span>
                  )}
                </div>
              </div>
              {workspace.isActive && (
                <div className="w-2 h-2 bg-[#2388ff] rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleCreateWorkspace}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Workspace Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </TooltipProvider>
  );
}
