"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Users, Search, Plus, Filter, MoreHorizontal, Edit, Trash2, BookOpen, RefreshCw, Eye, Save } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast";

interface Client {
  id: number;
  client_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  address: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  primary_diagnosis: string | null;
  admission_date: string | null;
  discharge_date: string | null;
  status: string;
  progress_percentage: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ProgramAssignment {
  id: number;
  client_id: number;
  program_id: number;
  enrollment_date: string;
  completion_date: string | null;
  status: string;
  progress_notes: string | null;
  program_name: string;
  program_description: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [programAssignments, setProgramAssignments] = useState<ProgramAssignment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const [clientsResponse, assignmentsResponse] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/client-programs')
      ]);

      if (clientsResponse.ok) {
        const data = await clientsResponse.json();
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error('Expected array but got:', typeof data, data);
          setClients([]);
        }
      }

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        if (Array.isArray(assignmentsData)) {
          setProgramAssignments(assignmentsData);
        } else {
          setProgramAssignments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
      setProgramAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!Array.isArray(clients)) {
      setFilteredClients([]);
      return;
    }
    const filtered = clients.filter(client => 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.client_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  // Calculate stats from filtered data
  const totalClients = Array.isArray(clients) ? clients.length : 0;
  const activeClients = Array.isArray(clients) ? clients.filter(client => client.status === 'Active').length : 0;
  const aftercareClients = Array.isArray(clients) ? clients.filter(client => client.status === 'Aftercare').length : 0;
  const successRate = totalClients > 0 ? Math.round((aftercareClients / totalClients) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Aftercare":
        return "bg-blue-100 text-blue-800"
      case "Discharged":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClientProgram = (clientId: number) => {
    const assignment = programAssignments.find(assignment => assignment.client_id === clientId);
    return assignment;
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    setDeleting(true);
    const loadingToast = showLoading('Deleting client...');

    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess('Client deleted successfully!');
        setDeleteDialogOpen(false);
        setViewDialogOpen(false);
        setSelectedClient(null);
        setDeleteConfirmation(''); // Reset confirmation
        fetchClients(); // Refresh the data
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to delete client: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      dismissToast(loadingToast);
      showError('Failed to delete client. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDialogOpen = (client: Client) => {
    setSelectedClient(client);
    setDeleteConfirmation(''); // Reset confirmation when opening
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (client: Client) => {
    setSelectedClient(client);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading clients...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your recovery center clients and their progress
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={fetchClients} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/clients/new'} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              Currently in treatment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aftercare</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aftercareClients}</div>
            <p className="text-xs text-muted-foreground">
              In aftercare support
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            Search and manage all clients in your recovery center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search clients by name, email, phone, ID, or status..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder-user.jpg`} />
                          <AvatarFallback>
                            {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.first_name} {client.last_name}</div>
                          <div className="text-sm text-muted-foreground">ID: {client.client_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const program = getClientProgram(client.id);
                        if (program) {
                          return (
                            <div>
                              <div className="font-medium text-sm">{program.program_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {program.status} • {new Date(program.enrollment_date).toLocaleDateString()}
                                {program.completion_date && (
                                  <div className="text-green-600">
                                    Completed: {new Date(program.completion_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        }
                        return (
                          <span className="text-muted-foreground text-sm">Not Assigned</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {client.admission_date ? new Date(client.admission_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${client.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{client.progress_percentage || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openViewDialog(client)}
                          title="View client details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.location.href = `/clients/${client.id}/edit`}
                          title="Edit client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteDialogOpen(client)}
                          title="Delete client"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Dialog - Read Only */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Client Details
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client ID</Label>
                    <p className="text-sm">{selectedClient.client_id}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <p className="text-sm">{selectedClient.first_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <p className="text-sm">{selectedClient.last_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <p className="text-sm">{formatDate(selectedClient.date_of_birth)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <p className="text-sm">{selectedClient.gender || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <p className="text-sm">{selectedClient.email || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <p className="text-sm">{selectedClient.phone || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <p className="text-sm">{selectedClient.emergency_contact_name || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <p className="text-sm">{selectedClient.emergency_contact_phone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <p className="text-sm">{selectedClient.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Insurance Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_provider">Insurance Provider</Label>
                    <p className="text-sm">{selectedClient.insurance_provider || 'Not provided'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_policy_number">Policy Number</Label>
                    <p className="text-sm">{selectedClient.insurance_policy_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Medical Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
                  <p className="text-sm">{selectedClient.primary_diagnosis || 'Not provided'}</p>
                </div>
              </div>

              {/* Treatment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Treatment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Badge variant="secondary" className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="progress_percentage">Progress (%)</Label>
                    <p className="text-sm">{selectedClient.progress_percentage || 0}%</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_date">Admission Date</Label>
                    <p className="text-sm">{formatDate(selectedClient.admission_date)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discharge_date">Discharge Date</Label>
                    <p className="text-sm">{formatDate(selectedClient.discharge_date)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <p className="text-sm">{selectedClient.notes || 'No notes available'}</p>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">System Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{formatDateTime(selectedClient.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm">{formatDateTime(selectedClient.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedClient?.first_name} {selectedClient?.last_name}</strong> (ID: {selectedClient?.client_id})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogDescription className="space-y-4">
            <div>
              <p>This action will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>All client information and records</li>
                <li>Program assignments for this client</li>
                <li>Session participation records</li>
                <li>All associated data</li>
              </ul>
              <p className="font-semibold text-destructive mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                To confirm deletion, please type <strong>DELETE</strong> in the field below:
              </Label>
              <Input
                id="delete-confirmation"
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="font-mono"
                disabled={deleting}
              />
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleting}
              onClick={() => setDeleteConfirmation('')}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              disabled={deleting || deleteConfirmation !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 