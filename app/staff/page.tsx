"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Plus, Clock, Calendar, Search, Edit, Trash2, Key, User, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessDenied } from "@/components/protected-route";
import { canManageStaff, canDeleteRecords, getRoleDisplayName, UserRole } from "@/lib/auth";

interface Staff {
  id: number;
  user_id: number | null;
  employee_id: string;
  first_name: string;
  last_name: string;
  title: string;
  specialization: string | null;
  phone: string | null;
  emergency_contact: string | null;
  hire_date: string;
  status: string;
  availability_status: string;
  max_clients: number;
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
}

function StaffPageContent() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; staffId: number | null; userId: number | null }>({ open: false, staffId: null, userId: null });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setStaff(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    if (!Array.isArray(staff)) {
      setFilteredStaff([]);
      return;
    }
    const filtered = staff.filter(member => 
      (member.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.employee_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.status?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.availability_status?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  };

  // Calculate stats from database
  const totalStaff = Array.isArray(staff) ? staff.length : 0;
  const availableStaff = Array.isArray(staff) ? staff.filter(member => member.availability_status === 'available').length : 0;
  const onCallStaff = Array.isArray(staff) ? staff.filter(member => member.availability_status === 'on_call').length : 0;
  const avgClientLoad = totalStaff > 0 ? (staff.reduce((sum, member) => sum + member.max_clients, 0) / totalStaff).toFixed(1) : '0';
  const activeUsers = Array.isArray(staff) ? staff.filter(member => member.is_active).length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "in_session":
        return "bg-blue-100 text-blue-800"
      case "on_call":
        return "bg-yellow-100 text-yellow-800"
      case "off_duty":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "clinical_director":
        return "bg-purple-100 text-purple-800"
      case "counselor":
        return "bg-blue-100 text-blue-800"
      case "nurse":
        return "bg-green-100 text-green-800"
      case "therapist":
        return "bg-orange-100 text-orange-800"
      case "staff":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteStaff = async (staffId: number) => {
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchStaff(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.userId || !newPassword) return;

    try {
      const response = await fetch(`/api/users/${resetPasswordDialog.userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setResetPasswordDialog({ open: false, staffId: null, userId: null });
        setNewPassword('');
        alert('Password reset successfully');
      } else {
        const error = await response.json();
        alert(`Error resetting password: ${error.error}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading staff...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage your recovery center staff, user accounts, and access permissions
          </p>
        </div>
        <Button onClick={() => window.location.href = '/staff/new'}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Full-time and part-time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableStaff}</div>
            <p className="text-xs text-muted-foreground">
              Ready for sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Call</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onCallStaff}</div>
            <p className="text-xs text-muted-foreground">
              Emergency response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Portal access enabled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Client Load</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClientLoad}</div>
            <p className="text-xs text-muted-foreground">
              Per staff member
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            View and manage all staff members and their user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search staff by name, title, username, email, role, or status..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Title & Specialization</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>User Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder-user.jpg`} />
                        <AvatarFallback>
                          {member.first_name?.[0] || ''}{member.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.first_name || ''} {member.last_name || ''}</div>
                        <div className="text-sm text-muted-foreground">ID: {member.employee_id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.title}</div>
                      <div className="text-sm text-muted-foreground">{member.specialization}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{member.phone}</div>
                      <div className="text-sm text-muted-foreground">{member.emergency_contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.username ? (
                      <div>
                        <div className="text-sm font-medium">{member.username}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                        <Badge variant={member.is_active ? "default" : "secondary"} className="mt-1">
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No account</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.role ? (
                      <Badge variant="secondary" className={getRoleColor(member.role)}>
                        {getRoleDisplayName(member.role)}
                      </Badge>
                    ) : (
                      <div className="text-sm text-muted-foreground">No role</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(member.availability_status)}>
                      {member.availability_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.location.href = `/staff/${member.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {member.user_id && (
                        <Dialog open={resetPasswordDialog.open && resetPasswordDialog.staffId === member.id} onOpenChange={(open) => setResetPasswordDialog({ open, staffId: open ? member.id : null, userId: open ? member.user_id : null })}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Key className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reset Password</DialogTitle>
                              <DialogDescription>
                                Set a new password for {member.first_name || ''} {member.last_name || ''}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Enter new password"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setResetPasswordDialog({ open: false, staffId: null, userId: null })}>
                                Cancel
                              </Button>
                              <Button onClick={handleResetPassword}>
                                Reset Password
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDeleteRecords() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {member.first_name || ''} {member.last_name || ''}? This action cannot be undone.
                                {member.user_id && " Their user account will also be deactivated."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStaff(member.id)}>
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

export default function StaffPage() {
  if (!canManageStaff()) {
    return <AccessDenied 
      requiredRoles={['admin', 'clinical_director'] as UserRole[]}
      message="You need administrator or clinical director permissions to manage staff."
    />;
  }

  return <StaffPageContent />;
} 