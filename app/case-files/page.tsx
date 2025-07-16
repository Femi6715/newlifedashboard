"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Search, Eye, Trash2, Download, Filter, Calendar } from "lucide-react";
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
import { canManageCaseFiles, canDeleteRecords, UserRole } from "@/lib/auth";

interface CaseFile {
  id: number;
  client_id: number;
  file_type: string;
  status: string;
  file_name: string;
  file_path: string;
  description: string;
  created_at: string;
  updated_at: string;
  client_first_name: string;
  client_last_name: string;
  client_id_string: string;
}

function CaseFilesPageContent() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [filteredCaseFiles, setFilteredCaseFiles] = useState<CaseFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewDialog, setViewDialog] = useState<{ open: boolean; file: CaseFile | null }>({ open: false, file: null });

  useEffect(() => {
    fetchCaseFiles();
  }, []);

  useEffect(() => {
    filterCaseFiles();
  }, [searchTerm, caseFiles, selectedFileType, selectedStatus]);

  const fetchCaseFiles = async () => {
    try {
      const response = await fetch('/api/case-files');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setCaseFiles(data);
      } else {
        console.error('Expected array but got:', typeof data, data);
        setCaseFiles([]);
      }
    } catch (error) {
      console.error('Error fetching case files:', error);
      setCaseFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCaseFiles = () => {
    if (!Array.isArray(caseFiles)) {
      setFilteredCaseFiles([]);
      return;
    }
    
    let filtered = caseFiles.filter(file => {
      const matchesSearch = 
        (file.file_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (file.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (file.client_first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (file.client_last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (file.client_id_string?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesFileType = selectedFileType === 'all' || file.file_type === selectedFileType;
      const matchesStatus = selectedStatus === 'all' || file.status === selectedStatus;
      
      return matchesSearch && matchesFileType && matchesStatus;
    });
    
    setFilteredCaseFiles(filtered);
  };

  // Calculate stats from database
  const totalFiles = Array.isArray(caseFiles) ? caseFiles.length : 0;
  const activeFiles = Array.isArray(caseFiles) ? caseFiles.filter(file => file.status === 'active').length : 0;
  const archivedFiles = Array.isArray(caseFiles) ? caseFiles.filter(file => file.status === 'archived').length : 0;
  const pendingFiles = Array.isArray(caseFiles) ? caseFiles.filter(file => file.status === 'pending_review').length : 0;
  const recentFiles = Array.isArray(caseFiles) ? caseFiles.filter(file => {
    const fileDate = new Date(file.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return fileDate > weekAgo;
  }).length : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "intake":
        return "bg-blue-100 text-blue-800"
      case "assessment":
        return "bg-purple-100 text-purple-800"
      case "treatment_plan":
        return "bg-green-100 text-green-800"
      case "progress_note":
        return "bg-orange-100 text-orange-800"
      case "discharge":
        return "bg-red-100 text-red-800"
      case "legal":
        return "bg-indigo-100 text-indigo-800"
      case "medical":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/case-files/${fileId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCaseFiles(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting case file:', error);
    }
  };

  const formatFileType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading case files...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Case Files</h2>
          <p className="text-muted-foreground">
            Manage client case files and documentation
          </p>
        </div>
        <Button onClick={() => window.location.href = '/case-files/new'}>
          <Plus className="mr-2 h-4 w-4" />
          Add Case File
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              All case files
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFiles}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFiles}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedFiles}</div>
            <p className="text-xs text-muted-foreground">
              Archived files
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFiles}</div>
            <p className="text-xs text-muted-foreground">
              Added this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case File Directory</CardTitle>
          <CardDescription>
            View and manage all client case files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search files by name, client, or description..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                <SelectItem value="progress_note">Progress Note</SelectItem>
                <SelectItem value="discharge">Discharge</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCaseFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      <div className="text-sm text-muted-foreground">{file.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{file.client_first_name} {file.client_last_name}</div>
                      <div className="text-sm text-muted-foreground">ID: {file.client_id_string}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getFileTypeColor(file.file_type)}>
                      {formatFileType(file.file_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(file.status)}>
                      {file.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Dialog open={viewDialog.open && viewDialog.file?.id === file.id} onOpenChange={(open) => setViewDialog({ open, file: open ? file : null })}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Case File Details</DialogTitle>
                            <DialogDescription>
                              View details for {file.file_name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">File Information</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">File Name</p>
                                  <p className="font-medium">{file.file_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Type</p>
                                  <p className="font-medium">{formatFileType(file.file_type)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Status</p>
                                  <Badge variant="secondary" className={getStatusColor(file.status)}>
                                    {file.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Created</p>
                                  <p className="font-medium">{new Date(file.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Client Information</h4>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Client Name</p>
                                  <p className="font-medium">{file.client_first_name} {file.client_last_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Client ID</p>
                                  <p className="font-medium">{file.client_id_string}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium">Description</h4>
                              <p className="text-sm mt-2">{file.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" className="flex-1">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <FileText className="mr-2 h-4 w-4" />
                                Edit
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
                              <AlertDialogTitle>Delete Case File</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {file.file_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFile(file.id)}>
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

export default function CaseFilesPage() {
  if (!canManageCaseFiles()) {
    return <AccessDenied 
      requiredRoles={['admin', 'clinical_director', 'counselor', 'therapist'] as UserRole[]}
      message="You need administrator, clinical director, counselor, or therapist permissions to manage case files."
    />;
  }

  return <CaseFilesPageContent />;
} 