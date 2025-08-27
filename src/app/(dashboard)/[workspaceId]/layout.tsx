"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  Layout,
  Settings,
  LogOut,
  BarChart3,
  DollarSign,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Templates", href: "/templates", icon: Layout },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const getWorkspaceId = async () => {
      const { workspaceId: id } = await params;
      setWorkspaceId(id);
    };
    getWorkspaceId();
  }, [params]);

  // Update navigation to include workspace ID
  const workspaceNavigation = navigation.map(item => ({
    ...item,
    href: `/${workspaceId}${item.href}`
  }));

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 justify-left">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Image src="/linea.svg" alt="Linea" width={32} height={32} />
              </div>
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <h1 className="text-xl font-bold text-gray-900">Linea</h1>
              </div>
            </div>
            
            <div className="px-2 mt-4">
              <WorkspaceSwitcher />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <Button 
                  className="w-full flex items-center justify-center border-gray-400 border"
                  onClick={() => router.push(`/${workspaceId}/invoices`)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="group-data-[collapsible=icon]:hidden">New Invoice</span>
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {workspaceNavigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2 p-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#2388ff] text-white text-sm">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </div>
              </div>
              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 group-data-[collapsible=icon]:hidden"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="flex h-16 sticky top-0 z-10 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            <div className="w-full max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
