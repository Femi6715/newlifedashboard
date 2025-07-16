"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Plus, Search, Eye, Trash2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessDenied } from "@/components/protected-route";
import { canManageIntake, canDeleteRecords, UserRole } from "@/lib/auth";

interface IntakeCall {
  id: number;
  caller_name: string;
  caller_phone: string;
  caller_email: string;
  call_type: string;
  urgency_level: string;
  description: string;
  status: string;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  assigned_to_name?: string;
}

function IntakePageContent() {
  const [intakeCalls, setIntakeCalls] = useState<IntakeCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<IntakeCall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCallType, setSelectedCallType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewDialog, setViewDialog] = useState<{ open: boolean; call: IntakeCall | null }>({ open: false, call: null });

  useEffect(() => {
    fetchIntakeCalls();
  }, []);

  useEffect(() => {
    filterCalls();
  }, [searchTerm, intakeCalls, selectedCallType, selectedStatus]);

  const fetchIntakeCalls = async () => {
    try {
      const response = await fetch('/api/intake-calls');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setIntakeCalls(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setIntakeCalls([]);
      }
    } catch (error) {
      console.error('Error fetching intake calls:', error);
      setIntakeCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCalls = () => {
    if (!Array.isArray(intakeCalls)) {
      setFilteredCalls([]);
      return;
    }
    
    let filtered = intakeCalls.filter(call => {
      const matchesSearch = 
        (call.caller_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (call.caller_phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (call.caller_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (call.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCallType = selectedCallType === 'all' || call.call_type === selectedCallType;
      const matchesStatus = selectedStatus === 'all' || call.status === selectedStatus;
      
      return matchesSearch && matchesCallType && matchesStatus;
    });
    
    setFilteredCalls(filtered);
  };

  // Calculate stats from database
  const totalCalls = Array.isArray(intakeCalls) ? intakeCalls.length : 0;
  const pendingCalls = Array.isArray(intakeCalls) ? intakeCalls.filter(call => call.status === 'pending').length : 0;
  const emergencyCalls = Array.isArray(intakeCalls) ? intakeCalls.filter(call => call.urgency_level === 'critical').length : 0;
  const completedCalls = Array.isArray(intakeCalls) ? intakeCalls.filter(call => call.status === 'completed').length : 0;
  const todayCalls = Array.isArray(intakeCalls) ? intakeCalls.filter(call => {
    const callDate = new Date(call.created_at);
    const today = new Date();
    return callDate.toDateString() === today.toDateString();
  }).length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-100 text-red-800"
      case "inquiry":
        return "bg-blue-100 text-blue-800"
      case "follow_up":
        return "bg-purple-100 text-purple-800"
      case "referral":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteCall = async (callId: number) => {
    try {
      const response = await fetch(`/api/intake-calls/${callId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchIntakeCalls(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting intake call:', error);
    }
  };

  const formatCallType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatUrgency = (urgency: string) => {
    return urgency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading intake calls...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">24/7 Intake Management</h2>
          <p className="text-muted-foreground">
            Manage incoming calls and intake requests
          </p>
        </div>
        <Button onClick={() => window.location.href = '/intake/new'}>
          <Plus className="mr-2 h-4 w-4" />
          Add Intake Call
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              All intake calls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Calls</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCalls}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Calls</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emergencyCalls}</div>
            <p className="text-xs text-muted-foreground">
              Critical urgency
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCalls}</div>
            <p className="text-xs text-muted-foreground">
              Successfully handled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalls}</div>
            <p className="text-xs text-muted-foreground">
              Calls today
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intake Call Directory</CardTitle>
          <CardDescription>
            View and manage all incoming intake calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search calls by caller name, phone, or description..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCallType} onValueChange={setSelectedCallType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Call Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caller</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{call.caller_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{call.caller_phone}</div>
                      <div className="text-sm text-muted-foreground">{call.caller_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getCallTypeColor(call.call_type)}>
                      {formatCallType(call.call_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getUrgencyColor(call.urgency_level)}>
                      {formatUrgency(call.urgency_level)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(call.status)}>
                      {call.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(call.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Dialog open={viewDialog.open && viewDialog.call?.id === call.id} onOpenChange={(open) => setViewDialog({ open, call: open ? call : null })}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Intake Call Details</DialogTitle>
                            <DialogDescription>
                              View details for call from {call.caller_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Caller Information</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Name</p>
                                  <p className="font-medium">{call.caller_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="font-medium">{call.caller_phone}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{call.caller_email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Created</p>
                                  <p className="font-medium">{new Date(call.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Call Details</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Type</p>
                                  <Badge variant="secondary" className={getCallTypeColor(call.call_type)}>
                                    {formatCallType(call.call_type)}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Urgency</p>
                                  <Badge variant="secondary" className={getUrgencyColor(call.urgency_level)}>
                                    {formatUrgency(call.urgency_level)}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge variant="secondary" className={getStatusColor(call.status)}>
                                    {call.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Assigned To</p>
                                  <p className="font-medium">{call.assigned_to_name || 'Unassigned'}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Description</h4>
                              <p className="text-sm mt-2">{call.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" className="flex-1">
                                <Phone className="mr-2 h-4 w-4" />
                                Call Back
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {canDeleteRecords() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Intake Call</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this call from {call.caller_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCall(call.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function IntakePage() {
  if (!canManageIntake()) {
    return <AccessDenied 
      requiredRoles={['admin', 'clinical_director', 'counselor', 'nurse'] as UserRole[]}
      message="You need administrator, clinical director, counselor, or nurse permissions to manage intake calls."
    />;
  }

  return <IntakePageContent />;
} 