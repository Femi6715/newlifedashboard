"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, Calendar, Users, TrendingUp, FileText, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccessDenied } from "@/components/protected-route";
import { canViewReports, UserRole } from "@/lib/auth";

function ReportsPageContent() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            View comprehensive reports and analytics for your recovery center
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              All programs running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Stay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 days</div>
            <p className="text-xs text-muted-foreground">
              -2 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Program Performance</CardTitle>
            <CardDescription>
              Success rates by program type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Type</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Residential</TableCell>
                  <TableCell>342</TableCell>
                  <TableCell>89%</TableCell>
                  <TableCell>
                    <Badge variant="default">Excellent</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Outpatient</TableCell>
                  <TableCell>156</TableCell>
                  <TableCell>82%</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Good</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Aftercare</TableCell>
                  <TableCell>89</TableCell>
                  <TableCell>91%</TableCell>
                  <TableCell>
                    <Badge variant="default">Excellent</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Detox</TableCell>
                  <TableCell>67</TableCell>
                  <TableCell>78%</TableCell>
                  <TableCell>
                    <Badge variant="outline">Fair</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Performance</CardTitle>
            <CardDescription>
              Key metrics by staff member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Dr. Sarah McCormick</TableCell>
                  <TableCell>45</TableCell>
                  <TableCell>94%</TableCell>
                  <TableCell>
                    <Badge variant="default">5.0</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Michael Rodriguez</TableCell>
                  <TableCell>38</TableCell>
                  <TableCell>87%</TableCell>
                  <TableCell>
                    <Badge variant="secondary">4.8</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Emily Chen</TableCell>
                  <TableCell>42</TableCell>
                  <TableCell>91%</TableCell>
                  <TableCell>
                    <Badge variant="default">4.9</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>David Thompson</TableCell>
                  <TableCell>35</TableCell>
                  <TableCell>85%</TableCell>
                  <TableCell>
                    <Badge variant="secondary">4.7</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest admissions, discharges, and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2024-01-15</TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell>Admission</TableCell>
                <TableCell>Residential</TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-01-14</TableCell>
                <TableCell>Maria Garcia</TableCell>
                <TableCell>Discharge</TableCell>
                <TableCell>Outpatient</TableCell>
                <TableCell>
                  <Badge variant="secondary">Completed</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-01-13</TableCell>
                <TableCell>Robert Johnson</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Aftercare</TableCell>
                <TableCell>
                  <Badge variant="outline">Progress</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2024-01-12</TableCell>
                <TableCell>Lisa Wang</TableCell>
                <TableCell>Admission</TableCell>
                <TableCell>Detox</TableCell>
                <TableCell>
                  <Badge variant="default">Active</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  if (!canViewReports()) {
    return <AccessDenied 
      requiredRoles={['admin', 'clinical_director', 'counselor'] as UserRole[]}
      message="You need administrator, clinical director, or counselor permissions to view reports."
    />;
  }

  return <ReportsPageContent />;
} 