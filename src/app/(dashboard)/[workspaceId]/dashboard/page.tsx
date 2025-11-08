"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RevenueChart } from "@/components/charts/RevenueChart";
import {
  DollarSign,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

async function fetchDashboardData() {
  const response = await fetch('/api/dashboard');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const data = await response.json();
  return data.data;
}

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  totalAmount: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  recentInvoices: any[];
  recentClients: any[];
  revenueSeries: Array<{ month: string; total: number }>;
  analytics: {
    revenueGrowth: number;
    invoiceGrowth: number;
    clientGrowth: number;
  };
}

interface DashboardPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    const getWorkspaceId = async () => {
      const { workspaceId: id } = await params;
      setWorkspaceId(id);
    };
    getWorkspaceId();
  }, [params]);

  const { data: stats, isLoading: loading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard', workspaceId],
    queryFn: fetchDashboardData,
    enabled: !!workspaceId,
    retry: 1,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Chart Shimmer */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Failed to load dashboard data'}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: Number(stats.analytics.revenueGrowth) > 0 ? `+${Number(stats.analytics.revenueGrowth).toFixed(1)}%` : `${Number(stats.analytics.revenueGrowth).toFixed(1)}%`,
      changeType: Number(stats.analytics.revenueGrowth) >= 0 ? "positive" as const : "negative" as const,
      icon: DollarSign,
      description: "Total revenue from paid invoices",
    },
    {
      title: "Total Amount",
      value: formatCurrency(stats.totalAmount),
      change: "",
      changeType: "neutral" as const,
      icon: BarChart3,
      description: "Total amount of all invoices (including drafts)",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      change: "",
      changeType: "neutral" as const,
      icon: TrendingUp,
      description: "Revenue generated this month",
    },
    {
      title: "Total Invoices",
      value: stats.totalInvoices.toString(),
      change: Number(stats.analytics.invoiceGrowth) > 0 ? `+${Number(stats.analytics.invoiceGrowth).toFixed(1)}%` : `${Number(stats.analytics.invoiceGrowth).toFixed(1)}%`,
      changeType: Number(stats.analytics.invoiceGrowth) >= 0 ? "positive" as const : "negative" as const,
      icon: FileText,
      description: "Total number of invoices",
    },
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      change: Number(stats.analytics.clientGrowth) > 0 ? `+${Number(stats.analytics.clientGrowth).toFixed(1)}%` : `${Number(stats.analytics.clientGrowth).toFixed(1)}%`,
      changeType: Number(stats.analytics.clientGrowth) >= 0 ? "positive" as const : "negative" as const,
      icon: Users,
      description: "Total number of clients",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: FileText,
      description: "Invoices awaiting payment",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your business performance and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : stat.changeType === "negative" ? (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      ) : null}
                      <span
                        className={`text-sm ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Revenue Chart */}
         <Card className="border-0 shadow-sm">
           <CardHeader>
             <CardTitle>Revenue Overview</CardTitle>
           </CardHeader>
           <CardContent>
             <RevenueChart data={stats.revenueSeries || []} />
           </CardContent>
         </Card>

        {/* Recent Invoices */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {invoice.client?.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.title || `Invoice #${invoice.id.slice(-6)}`}
                        </p>
                        <p className="text-xs text-gray-500">{invoice.client?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </p>
                      <Badge
                        variant={
                          invoice.status === "PAID"
                            ? "default"
                            : invoice.status === "OVERDUE"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent invoices</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
