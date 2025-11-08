"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientForm } from "@/components/clients/ClientForm";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  companyName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  _count: {
    invoices: number;
  };
}

interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

async function fetchClientsData(searchTerm: string, filterStatus: string) {
  const params = new URLSearchParams();
  if (searchTerm) params.append('search', searchTerm);
  if (filterStatus !== 'all') params.append('status', filterStatus);
  
  const response = await fetch(`/api/clients?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  
  const data: ClientsResponse = await response.json();
  return data.data || { clients: [], total: 0 };
}

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clientsData, isLoading: loading, error } = useQuery({
    queryKey: ['clients', searchTerm, filterStatus],
    queryFn: () => fetchClientsData(searchTerm, filterStatus),
    retry: 1,
  });

  const clients = clientsData?.clients || [];
  const totalClients = clientsData?.total || 0;
  const activeClients = clients.filter((c: Client) => c.status === 'ACTIVE').length;
  const inactiveClients = clients.filter((c: Client) => c.status === 'INACTIVE').length;
  const archivedClients = clients.filter((c: Client) => c.status === 'ARCHIVED').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
    },
    onSuccess: () => {
      toast.success('Client deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: () => {
      toast.error('Failed to delete client');
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Client created successfully');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create client');
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, clientData }: { clientId: string; clientData: any }) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Client updated successfully');
      setEditingClient(null);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update client');
    },
  });

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    deleteClientMutation.mutate(clientId);
  };

  const handleCreateClient = async (clientData: any) => {
    createClientMutation.mutate(clientData);
  };

  const handleEditClient = async (clientData: any) => {
    if (!editingClient) return;
    updateClientMutation.mutate({ clientId: editingClient.id, clientData });
  };

  const handleStartEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
  };

  if (loading && (!clients || clients.length === 0)) {
    return (
      <div className="space-y-8">
        {/* Stats Cards Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Filters Shimmer */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        {/* Clients List Shimmer */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && (!clients || clients.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Clients</h3>
          <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : String(error)}</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['clients'] })} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (showForm || editingClient) {
    return (
      <div className="space-y-6">
        <ClientForm
          initialData={editingClient || undefined}
          onCancel={editingClient ? handleCancelEdit : () => setShowForm(false)}
          onSave={editingClient ? handleEditClient : handleCreateClient}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client relationships and billing information.
          </p>
        </div>
        <Button 
          className="bg-[#2388ff] hover:bg-blue-600"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{archivedClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("active")}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("inactive")}
              >
                Inactive
              </Button>
              <Button
                variant={filterStatus === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("archived")}
              >
                Archived
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : clients.length > 0 ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        <Badge className={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.city && client.state && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{client.city}, {client.state}</span>
                          </div>
                        )}
                      </div>
                      {client.companyName && (
                        <p className="text-xs text-gray-400 mt-1">{client.companyName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {client._count.invoices} invoices
                      </p>
                      <p className="text-xs text-gray-500">
                        Added {formatDate(client.createdAt)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartEdit(client)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClient(client.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first client.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button className="bg-[#2388ff] hover:bg-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
