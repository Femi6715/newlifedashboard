"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, BookOpen, Calendar, Search, CheckCircle, XCircle } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast";

interface Client {
  id: number;
  client_id: string;
  first_name: string;
  last_name: string;
  status: string;
}

interface Program {
  id: number;
  name: string;
  description: string;
  program_type: string;
  status: string;
}

interface Assignment {
  id: number;
  client_id: number;
  program_id: number;
  enrollment_date: string;
  completion_date: string | null;
  status: string;
  progress_notes: string | null;
  client_first_name: string;
  client_last_name: string;
  client_identifier: string;
  program_name: string;
  program_description: string;
}

export default function ProgramAssignmentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, []);

  // Debug effect to see when search changes
  useEffect(() => {
    console.log('Search term changed to:', searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      const [clientsRes, programsRes, assignmentsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/programs'),
        fetch('/api/client-programs')
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        console.log('Clients data:', clientsData);
        setClients(clientsData);
      }
      if (programsRes.ok) setPrograms(await programsRes.json());
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAssignProgram = async () => {
    if (!selectedProgram || selectedClients.length === 0) {
      showError('Please select a program and at least one client');
      return;
    }

    setLoading(true);
    const loadingToast = showLoading('Assigning program to clients...');

    try {
      const response = await fetch('/api/client-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds: selectedClients,
          programId: parseInt(selectedProgram),
          enrollmentDate,
          status: 'enrolled'
        })
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess(`Program assigned to ${selectedClients.length} client(s) successfully!`);
        setSelectedClients([]);
        setSelectedProgram('');
        fetchData();
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to assign program: ${error.error}`);
      }
    } catch (error) {
      console.error('Error assigning program:', error);
      dismissToast(loadingToast);
      showError('Failed to assign program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleClientSelection = (clientId: number) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleUnassignProgram = async (assignmentId: number) => {
    const loadingToast = showLoading('Unassigning program...');
    try {
      const response = await fetch(`/api/client-programs/${assignmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess('Program unassigned successfully!');
        fetchData();
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to unassign program: ${error.error}`);
      }
    } catch (error) {
      console.error('Error unassigning program:', error);
      dismissToast(loadingToast);
      showError('Failed to unassign program. Please try again.');
    }
  };

  const handleUpdateAssignment = async (assignmentId: number, updates: any) => {
    const loadingToast = showLoading('Updating assignment...');
    try {
      const response = await fetch(`/api/client-programs/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess('Assignment updated successfully!');
        fetchData();
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to update assignment: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      dismissToast(loadingToast);
      showError('Failed to update assignment. Please try again.');
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedAssignment) return;
    
    const loadingToast = showLoading('Marking program as complete...');
    try {
      const response = await fetch(`/api/client-programs/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completionDate,
          status: 'completed'
        }),
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess('Program marked as complete successfully!');
        setCompletionDialogOpen(false);
        setSelectedAssignment(null);
        fetchData();
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to mark program as complete: ${error.error}`);
      }
    } catch (error) {
      console.error('Error marking program as complete:', error);
      dismissToast(loadingToast);
      showError('Failed to mark program as complete. Please try again.');
    }
  };

  const openUnassignDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setUnassignDialogOpen(true);
  };

  const openCompletionDialog = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setCompletionDialogOpen(true);
  };

  const filteredClients = clients.filter(client =>
    (client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (client.client_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const activeClients = filteredClients.filter(client => 
    client.status === 'Active' || client.status === 'active'
  );

  // Debug logging
  console.log('Search term:', searchTerm);
  console.log('Total clients:', clients.length);
  console.log('Filtered clients:', filteredClients.length);
  console.log('Active clients:', activeClients.length);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Program Assignments</h2>
          <p className="text-muted-foreground">
            Assign programs to individual clients or groups
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Assign Program
            </CardTitle>
            <CardDescription>
              Select clients and assign them to a program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="program">Select Program</Label>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs
                    .filter(program => program.status === 'active')
                    .map(program => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enrollment Date */}
            <div className="space-y-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
              />
            </div>

            {/* Client Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or client ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Select Clients ({selectedClients.length} selected)</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                {activeClients.map(client => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleClientSelection(client.id)}
                    />
                    <Label htmlFor={`client-${client.id}`} className="text-sm cursor-pointer">
                      {client.first_name} {client.last_name} ({client.client_id})
                    </Label>
                  </div>
                ))}
                {activeClients.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active clients found</p>
                )}
              </div>
            </div>

            {/* Assign Button */}
            <Button 
              onClick={handleAssignProgram} 
              disabled={loading || selectedClients.length === 0 || !selectedProgram}
              className="w-full"
            >
              {loading ? 'Assigning...' : `Assign to ${selectedClients.length} Client(s)`}
            </Button>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Current Assignments
            </CardTitle>
            <CardDescription>
              View all active program assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <p className="text-muted-foreground">No assignments found</p>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 10).map(assignment => (
                    <div key={assignment.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {assignment.client_first_name} {assignment.client_last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.program_name}
                          </p>
                        </div>
                        <Badge variant={assignment.status === 'enrolled' ? 'default' : 'secondary'}>
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(assignment.enrollment_date).toLocaleDateString()}
                        </span>
                        <span>ID: {assignment.client_identifier}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Program Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(assignment => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {assignment.client_first_name} {assignment.client_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.client_identifier}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{assignment.program_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.program_description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.enrollment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.status === 'enrolled' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.completion_date 
                      ? new Date(assignment.completion_date).toLocaleDateString()
                      : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCompletionDialog(assignment)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Complete
                        </Button>
                      )
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newStatus = prompt('Enter new status (enrolled/completed/withdrawn):', assignment.status);
                          if (newStatus && ['enrolled', 'completed', 'withdrawn'].includes(newStatus)) {
                            handleUpdateAssignment(assignment.id, { status: newStatus });
                          }
                        }}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openUnassignDialog(assignment)}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Unassign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign {selectedAssignment?.client_first_name} {selectedAssignment?.client_last_name} from the "{selectedAssignment?.program_name}" program? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAssignment) {
                  handleUnassignProgram(selectedAssignment.id);
                  setUnassignDialogOpen(false);
                  setSelectedAssignment(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Unassign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completion Date Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Program as Complete</DialogTitle>
            <DialogDescription>
              Set the completion date for {selectedAssignment?.client_first_name} {selectedAssignment?.client_last_name} in the "{selectedAssignment?.program_name}" program.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-date">Completion Date</Label>
              <Input
                id="completion-date"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkComplete}>
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 