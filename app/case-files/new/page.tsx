"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast";

interface Client {
  id: number;
  client_id: string;
  first_name: string;
  last_name: string;
  status: string;
}

export default function NewCaseFilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: '',
    fileType: 'intake',
    title: '',
    description: '',
    filePath: '',
    fileSize: '',
    status: 'active'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched clients:', data); // Debug log
        if (Array.isArray(data)) {
          setClients(data);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/case-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientId: parseInt(formData.clientId),
          fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
          uploadedBy: 1 // TODO: Get from user session
        }),
      });

      if (response.ok) {
        showSuccess('Case file created successfully!');
        router.push('/case-files');
      } else {
        const error = await response.json();
        showError(`Error creating case file: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating case file:', error);
      showError('Failed to create case file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // and get back a file path. For now, we'll simulate this.
      const filePath = `/uploads/${file.name}`;
      const fileSize = file.size.toString();
      
      setFormData(prev => ({
        ...prev,
        filePath,
        fileSize
      }));
      
      showSuccess(`File "${file.name}" selected (${formatFileSize(file.size)})`);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const activeClients = clients.filter(client => 
    ['active', 'aftercare'].includes(client.status.toLowerCase())
  );
  
  // Fallback to all clients if no active ones found
  const displayClients = activeClients.length > 0 ? activeClients : clients;
  
  console.log('All clients:', clients); // Debug log
  console.log('Active clients:', activeClients); // Debug log
  console.log('Display clients:', displayClients); // Debug log

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
            <h2 className="text-3xl font-bold tracking-tight">Create New Case File</h2>
            <p className="text-muted-foreground">
              Add a new case file for a client
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
                Essential details about the case file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => handleChange('clientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayClients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        <div className="flex flex-col">
                          <span>{client.first_name} {client.last_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ID: {client.client_id} • Status: {client.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeClients.length === 0 && clients.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active clients found. Showing all {clients.length} clients.
                  </p>
                )}
                {clients.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No clients found. Please create clients first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Initial Assessment Report"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileType">File Type *</Label>
                <Select 
                  value={formData.fileType} 
                  onValueChange={(value) => handleChange('fileType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intake">Intake</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                    <SelectItem value="progress_note">Progress Note</SelectItem>
                    <SelectItem value="discharge">Discharge</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
              <CardDescription>
                Upload the associated file (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG up to 10MB
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file')?.click()}
                    className="mt-4"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
                {formData.filePath && (
                  <div className="text-sm text-green-600">
                    ✓ File selected: {formData.filePath.split('/').pop()}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="filePath">File Path</Label>
                <Input
                  id="filePath"
                  value={formData.filePath}
                  onChange={(e) => handleChange('filePath', e.target.value)}
                  placeholder="e.g., /uploads/assessment_report.pdf"
                />
                <p className="text-xs text-muted-foreground">
                  Manual file path entry (if not uploading)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileSize">File Size (bytes)</Label>
                <Input
                  id="fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) => handleChange('fileSize', e.target.value)}
                  placeholder="e.g., 1024000"
                />
                <p className="text-xs text-muted-foreground">
                  File size in bytes (optional)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Detailed description of the case file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter a detailed description of this case file..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

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
            disabled={loading || !formData.clientId || !formData.title}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Case File'}
          </Button>
        </div>
      </form>
    </div>
  );
} 