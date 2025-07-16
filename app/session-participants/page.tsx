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
import { Plus, Users, Calendar, Clock, Search, Trash2 } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Session {
  id: number;
  title: string;
  session_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  max_participants: number;
}

interface Client {
  id: number;
  client_id: string;
  first_name: string;
  last_name: string;
  status: string;
}

interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  title: string;
  availability_status: string;
}

interface Participant {
  id: number;
  session_id: number;
  client_id: number | null;
  staff_id: number | null;
  role: string;
  attendance_status: string;
  client_first_name: string | null;
  client_last_name: string | null;
  client_identifier: string | null;
  staff_first_name: string | null;
  staff_last_name: string | null;
  staff_employee_id: string | null;
  session_title: string;
  session_type: string;
}

export default function SessionParticipantsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, clientsRes, staffRes, participantsRes] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/clients'),
        fetch('/api/staff'),
        fetch('/api/session-participants')
      ]);

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        console.log('Loaded sessions:', sessionsData);
        setSessions(sessionsData);
      }
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (staffRes.ok) setStaff(await staffRes.json());
      if (participantsRes.ok) setParticipants(await participantsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddParticipants = async () => {
    if (!selectedSession || (selectedClients.length === 0 && selectedStaff.length === 0)) {
      showError('Please select a session and at least one participant');
      return;
    }

    setLoading(true);
    const loadingToast = showLoading('Adding participants to session...');
    
    try {
      const participants = [
        ...selectedClients.map(clientId => ({ clientId, role: 'participant' })),
        ...selectedStaff.map(staffId => ({ staffId, role: 'facilitator' }))
      ];

      const response = await fetch('/api/session-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(selectedSession),
          participants
        })
      });

      if (response.ok) {
        dismissToast(loadingToast);
        showSuccess(`Successfully added ${participants.length} participant(s) to session!`);
        setSelectedClients([]);
        setSelectedStaff([]);
        setSelectedSession('');
        fetchData();
      } else {
        const error = await response.json();
        dismissToast(loadingToast);
        showError(`Failed to add participants: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding participants:', error);
      dismissToast(loadingToast);
      showError('Failed to add participants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async (participantId: number) => {
    setParticipantToDelete(participantId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteParticipant = async () => {
    if (!participantToDelete) return;
    
    try {
      const response = await fetch(`/api/session-participants/${participantToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showSuccess('Participant removed successfully');
        fetchData(); // Refresh the list
      } else {
        const error = await response.json();
        showError(`Failed to remove participant: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      showError('Failed to remove participant. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    }
  };

  const toggleClientSelection = (clientId: number) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleStaffSelection = (staffId: number) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const filteredClients = clients.filter(client =>
    (
      (client.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client.client_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) &&
    (client.status?.toLowerCase() === 'active')
  );

  const availableStaff = staff.filter(s => (s.availability_status?.toLowerCase() === 'available'));
  const upcomingSessions = sessions;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Session Participants</h2>
          <p className="text-muted-foreground">
            Manage participants for individual and group sessions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Participants Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Participants
            </CardTitle>
            <CardDescription>
              Select a session and add clients or staff
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Session Selection */}
            <div className="space-y-2">
              <Label htmlFor="session">Select Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a session" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingSessions.map(session => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <div className="flex flex-col">
                        <span>{session.title || `${session.session_type} Session`}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.scheduled_date).toLocaleDateString()} at {session.scheduled_time}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Clients</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Select Clients ({selectedClients.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {filteredClients.map(client => (
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
                {filteredClients.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active clients found</p>
                )}
              </div>
            </div>

            {/* Staff Selection */}
            <div className="space-y-2">
              <Label>Select Staff ({selectedStaff.length} selected)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {availableStaff.map(staffMember => (
                  <div key={staffMember.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`staff-${staffMember.id}`}
                      checked={selectedStaff.includes(staffMember.id)}
                      onCheckedChange={() => toggleStaffSelection(staffMember.id)}
                    />
                    <Label htmlFor={`staff-${staffMember.id}`} className="text-sm cursor-pointer">
                      {staffMember.first_name} {staffMember.last_name} ({staffMember.title})
                    </Label>
                  </div>
                ))}
                {availableStaff.length === 0 && (
                  <p className="text-sm text-muted-foreground">No available staff found</p>
                )}
              </div>
            </div>

            {/* Add Button */}
            <Button 
              onClick={handleAddParticipants} 
              disabled={loading || (selectedClients.length === 0 && selectedStaff.length === 0) || !selectedSession}
              className="w-full"
            >
              {loading ? 'Adding...' : `Add ${selectedClients.length + selectedStaff.length} Participant(s)`}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Participants
            </CardTitle>
            <CardDescription>
              View recent session participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {participants.length === 0 ? (
                <p className="text-muted-foreground">No participants found</p>
              ) : (
                <div className="space-y-3">
                  {participants.slice(0, 8).map(participant => (
                    <div key={participant.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {participant.client_first_name 
                              ? `${participant.client_first_name} ${participant.client_last_name}`
                              : `${participant.staff_first_name} ${participant.staff_last_name}`
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {participant.session_title || `${participant.session_type} Session`}
                          </p>
                        </div>
                        <Badge variant={participant.role === 'facilitator' ? 'default' : 'secondary'}>
                          {participant.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {participant.attendance_status}
                        </span>
                        <span>
                          {participant.client_identifier || participant.staff_employee_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Session Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Attendance Status</TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map(participant => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {participant.client_first_name 
                          ? `${participant.client_first_name} ${participant.client_last_name}`
                          : `${participant.staff_first_name} ${participant.staff_last_name}`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {participant.client_identifier || participant.staff_employee_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {participant.session_title || `${participant.session_type} Session`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={participant.role === 'facilitator' ? 'default' : 'secondary'}>
                      {participant.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      participant.attendance_status === 'attended' ? 'default' : 
                      participant.attendance_status === 'no_show' ? 'destructive' : 'secondary'
                    }>
                      {participant.attendance_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {participant.session_type}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteParticipant(participant.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this participant from the session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteParticipant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 