"use client"
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, User, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StaffMember {
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
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  last_login?: string;
}

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    title: '',
    specialization: '',
    phone: '',
    emergencyContact: '',
    hireDate: '',
    status: 'active',
    availabilityStatus: 'available',
    maxClients: 20
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [portalDialog, setPortalDialog] = useState(false);
  const [portalForm, setPortalForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
  });
  const [portalLoading, setPortalLoading] = useState(false);
  const portalFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        const response = await fetch(`/api/staff/${staffId}`);
        if (response.ok) {
          const staffData = await response.json();
          setStaffMember(staffData);
          setFormData({
            employeeId: staffData.employee_id || '',
            firstName: staffData.first_name || '',
            lastName: staffData.last_name || '',
            title: staffData.title || '',
            specialization: staffData.specialization || '',
            phone: staffData.phone || '',
            emergencyContact: staffData.emergency_contact || '',
            hireDate: staffData.hire_date ? staffData.hire_date.split('T')[0] : '',
            status: staffData.status || 'active',
            availabilityStatus: staffData.availability_status || 'available',
            maxClients: staffData.max_clients || 20
          });
        } else {
          alert('Failed to fetch staff member');
          router.push('/staff');
        }
      } catch (error) {
        console.error('Error fetching staff member:', error);
        alert('Failed to fetch staff member');
        router.push('/staff');
      } finally {
        setFetching(false);
      }
    };

    if (staffId) {
      fetchStaffMember();
    }
  }, [staffId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/staff');
      } else {
        const error = await response.json();
        alert(`Error updating staff member: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating staff member:', error);
      alert('Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetPassword = async () => {
    if (!newPassword || !staffMember?.user_id) return;

    try {
      const response = await fetch(`/api/users/${staffMember.user_id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        setResetPasswordDialog(false);
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

  const handlePortalFormChange = (field: string, value: string) => {
    setPortalForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePortalAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portalForm.password !== portalForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setPortalLoading(true);
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createUserAccount: true,
          userAccount: {
            username: portalForm.username,
            email: portalForm.email,
            password: portalForm.password,
            role: portalForm.role,
          },
        }),
      });
      if (response.ok) {
        setPortalDialog(false);
        setPortalForm({ username: '', email: '', password: '', confirmPassword: '', role: 'staff' });
        // Refresh the staff member data
        const refreshResponse = await fetch(`/api/staff/${staffId}`);
        if (refreshResponse.ok) {
          const staffData = await refreshResponse.json();
          setStaffMember(staffData);
        }
        alert('Portal access created successfully');
      } else {
        const error = await response.json();
        alert(`Error creating portal access: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create portal access');
    } finally {
      setPortalLoading(false);
    }
  };

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

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading staff member...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Staff Member</h2>
            <p className="text-muted-foreground">
              Update staff member information and user account
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Staff member's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  placeholder="e.g., EMP001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="e.g., John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="e.g., Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Licensed Counselor"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  placeholder="e.g., CBT Therapy, Addiction Counseling"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
              <CardDescription>
                Employment status and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Employment Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityStatus">Availability Status</Label>
                <Select 
                  value={formData.availabilityStatus} 
                  onValueChange={(value) => handleChange('availabilityStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_session">In Session</SelectItem>
                    <SelectItem value="on_call">On Call</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxClients">Max Clients</Label>
                <Input
                  id="maxClients"
                  type="number"
                  value={formData.maxClients}
                  onChange={(e) => handleChange('maxClients', parseInt(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>
              Emergency contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  placeholder="(555) 123-4568"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Account Information */}
        {staffMember && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>User Account</CardTitle>
              </div>
              <CardDescription>
                Portal access information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {staffMember.username ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">Username</Label>
                      <p className="text-sm text-muted-foreground">{staffMember.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{staffMember.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={getRoleColor(staffMember.role || '')}>
                          {staffMember.role?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge variant={staffMember.is_active ? "default" : "secondary"}>
                          {staffMember.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {staffMember.last_login && (
                    <div>
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(staffMember.last_login).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Set a new password for {staffMember.first_name || ''} {staffMember.last_name || ''}
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
                          <Button variant="outline" onClick={() => setResetPasswordDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleResetPassword}>
                            Reset Password
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to user edit page
                        if (staffMember.user_id) {
                          window.open(`/users/${staffMember.user_id}/edit`, '_blank');
                        }
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Edit User Account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No user account created</p>
                  <p className="text-sm text-muted-foreground">
                    This staff member does not have portal access
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => setPortalDialog(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Create Portal Access
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Updating...' : 'Update Staff Member'}
          </Button>
        </div>
      </form>

      {/* Create Portal Access Dialog */}
      <Dialog open={portalDialog} onOpenChange={setPortalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Portal Access</DialogTitle>
            <DialogDescription>
              Create a user account for {staffMember?.first_name || ''} {staffMember?.last_name || ''} to access the portal.
            </DialogDescription>
          </DialogHeader>
          <form ref={portalFormRef} onSubmit={handleCreatePortalAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal-username">Username</Label>
              <Input id="portal-username" value={portalForm.username} onChange={e => handlePortalFormChange('username', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-email">Email</Label>
              <Input id="portal-email" type="email" value={portalForm.email} onChange={e => handlePortalFormChange('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-password">Password</Label>
              <Input id="portal-password" type="password" value={portalForm.password} onChange={e => handlePortalFormChange('password', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-confirm-password">Confirm Password</Label>
              <Input id="portal-confirm-password" type="password" value={portalForm.confirmPassword} onChange={e => handlePortalFormChange('confirmPassword', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-role">Role</Label>
              <Select value={portalForm.role} onValueChange={value => handlePortalFormChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="clinical_director">Clinical Director</SelectItem>
                  <SelectItem value="counselor">Counselor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPortalDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={portalLoading}>{portalLoading ? 'Creating...' : 'Create Portal Access'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 