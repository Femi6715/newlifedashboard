"use client"
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    programType: 'therapy',
    durationWeeks: 12,
    maxParticipants: 20,
    cost: 0,
    status: 'active',
    startDate: '',
    endDate: '',
    requirements: '',
    outcomes: ''
  });

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs/${programId}`);
        if (response.ok) {
          const program = await response.json();
          setFormData({
            programName: program.program_name || '',
            description: program.description || '',
            programType: program.program_type || 'therapy',
            durationWeeks: program.duration_weeks || 12,
            maxParticipants: program.max_participants || 20,
            cost: program.cost || 0,
            status: program.status || 'active',
            startDate: program.start_date ? program.start_date.split('T')[0] : '',
            endDate: program.end_date ? program.end_date.split('T')[0] : '',
            requirements: program.requirements || '',
            outcomes: program.outcomes || ''
          });
        } else {
          alert('Failed to fetch program');
          router.push('/programs');
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        alert('Failed to fetch program');
        router.push('/programs');
      } finally {
        setFetching(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/programs');
      } else {
        const error = await response.json();
        alert(`Error updating program: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating program:', error);
      alert('Failed to update program');
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

  if (fetching) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading program...</span>
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
            <h2 className="text-3xl font-bold tracking-tight">Edit Program</h2>
            <p className="text-muted-foreground">
              Update program information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Program Details */}
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
              <CardDescription>
                Basic information about the program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="programName">Program Name</Label>
                <Input
                  id="programName"
                  value={formData.programName}
                  onChange={(e) => handleChange('programName', e.target.value)}
                  placeholder="e.g., Cognitive Behavioral Therapy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter program description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programType">Program Type</Label>
                <Select 
                  value={formData.programType} 
                  onValueChange={(value) => handleChange('programType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="therapy">Therapy</SelectItem>
                    <SelectItem value="support_group">Support Group</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="recreational">Recreational</SelectItem>
                    <SelectItem value="life_skills">Life Skills</SelectItem>
                    <SelectItem value="relapse_prevention">Relapse Prevention</SelectItem>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pilot">Pilot</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Program Schedule & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Capacity</CardTitle>
              <CardDescription>
                Program duration and participant limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationWeeks">Duration (weeks)</Label>
                <Input
                  id="durationWeeks"
                  type="number"
                  value={formData.durationWeeks}
                  onChange={(e) => handleChange('durationWeeks', parseInt(e.target.value))}
                  min="1"
                  max="52"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements & Outcomes */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Prerequisites for joining the program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                placeholder="Enter program requirements..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expected Outcomes</CardTitle>
              <CardDescription>
                What participants can expect to achieve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.outcomes}
                onChange={(e) => handleChange('outcomes', e.target.value)}
                placeholder="Enter expected outcomes..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

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
            {loading ? 'Updating...' : 'Update Program'}
          </Button>
        </div>
      </form>
    </div>
  );
} 