"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: session?.user?.email || "",
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (workspaceData: { name: string; description: string; type: string }) => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workspace');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Workspace created successfully!');
      router.replace(`/${data.data.id}/dashboard`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create workspace');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createWorkspaceMutation.mutate({
      name: formData.name,
      description: formData.description,
      type: 'PERSONAL',
    });
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <Skeleton className="mx-auto mb-4 h-12 w-12 rounded-full" />
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Linea!</CardTitle>
          <CardDescription>
            Let's set up your first workspace to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="My Business"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={createWorkspaceMutation.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="Brief description of your business"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={createWorkspaceMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={createWorkspaceMutation.isPending}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={createWorkspaceMutation.isPending}>
              {createWorkspaceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
