"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Plus, Search, Edit, Trash2, Users, Calendar, Target } from "lucide-react";
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
import { AccessDenied } from "@/components/protected-route";
import { canManagePrograms, canDeleteRecords, getRoleDisplayName, UserRole } from "@/lib/auth";

interface Program {
  id: number;
  name: string;
  description: string;
  program_type: string;
  duration_weeks: number;
  max_capacity: number;
  current_enrollment: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function ProgramsPageContent() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, programs]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setPrograms(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    if (!Array.isArray(programs)) {
      setFilteredPrograms([]);
      return;
    }
    const filtered = programs.filter(program => 
      (program.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.program_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (program.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredPrograms(filtered);
  };

  // Calculate stats from database
  const totalPrograms = Array.isArray(programs) ? programs.length : 0;
  const activePrograms = Array.isArray(programs) ? programs.filter(program => program.status === 'active').length : 0;
  const totalCapacity = Array.isArray(programs) ? programs.reduce((sum, program) => sum + (program.max_capacity || 0), 0) : 0;
  const totalEnrollment = Array.isArray(programs) ? programs.reduce((sum, program) => sum + (program.current_enrollment || 0), 0) : 0;
  const avgDuration = totalPrograms > 0 ? (programs.reduce((sum, program) => sum + (program.duration_weeks || 0), 0) / totalPrograms).toFixed(1) : '0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "discontinued":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800"
      case "outpatient":
        return "bg-green-100 text-green-800"
      case "aftercare":
        return "bg-purple-100 text-purple-800"
      case "detox":
        return "bg-orange-100 text-orange-800"
      case "partial_hospitalization":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteProgram = async (programId: number) => {
    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPrograms(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading programs...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Program Management</h2>
          <p className="text-muted-foreground">
            Manage recovery programs, enrollment, and capacity
          </p>
        </div>
        <Button onClick={() => window.location.href = '/programs/new'}>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPrograms}</div>
            <p className="text-xs text-muted-foreground">
              All program types
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              Maximum enrollment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollment}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}</div>
            <p className="text-xs text-muted-foreground">
              Weeks per program
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Directory</CardTitle>
          <CardDescription>
            View and manage all recovery programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search programs by name, type, or status..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{program.name}</div>
                      <div className="text-sm text-muted-foreground">{program.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getTypeColor(program.program_type)}>
                      {program.program_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{program.duration_weeks} weeks</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {program.current_enrollment || 0} / {program.max_capacity || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {program.max_capacity > 0 ? (((program.current_enrollment || 0) / program.max_capacity) * 100).toFixed(0) : '0'}% full
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(program.status)}>
                      {program.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.location.href = `/programs/${program.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canDeleteRecords() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {program.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProgram(program.id)}>
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

export default function ProgramsPage() {
  if (!canManagePrograms()) {
    return <AccessDenied 
      requiredRoles={['admin', 'clinical_director'] as UserRole[]}
      message="You need administrator or clinical director permissions to manage programs."
    />;
  }

  return <ProgramsPageContent />;
} 