"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface DashboardData {
  clients: any[];
  sessions: any[];
  staff: any[];
  programs: any[];
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData>({ clients: [], sessions: [], staff: [], programs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, sessionsRes, staffRes, programsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/sessions'),
        fetch('/api/staff'),
        fetch('/api/programs')
      ]);

      const [clients, sessions, staff, programs] = await Promise.all([
        clientsRes.json(),
        sessionsRes.json(),
        staffRes.json(),
        programsRes.json()
      ]);

      setData({
        clients: Array.isArray(clients) ? clients : [],
        sessions: Array.isArray(sessions) ? sessions : [],
        staff: Array.isArray(staff) ? staff : [],
        programs: Array.isArray(programs) ? programs : []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard metrics
  const activeClients = data.clients.filter(client => client.status === 'active').length;
  const todaysSessions = data.sessions.filter(session => 
    new Date(session.scheduled_date).toDateString() === new Date().toDateString()
  ).length;
  const availableStaff = data.staff.filter(member => member.availability_status === 'available').length;
  const onCallStaff = data.staff.filter(member => member.availability_status === 'on_call').length;
  const activePrograms = data.programs.filter(program => program.status === 'active').length;
  const avgSuccessRate = data.programs.length > 0 
    ? Math.round(data.programs.reduce((sum, program) => sum + (program.success_rate || 0), 0) / data.programs.length)
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at NewLife Recovery today.
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Calendar className="mr-2 h-4 w-4" />
          View Calendar
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSessions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Available</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableStaff}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{onCallStaff}</span> on call
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your recovery center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New client intake completed</p>
                  <p className="text-xs text-muted-foreground">
                    {data.clients.length > 0 ? `${data.clients[0].first_name} ${data.clients[0].last_name}` : 'Client'} completed intake process - 2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Group therapy session scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    {data.sessions.length > 0 ? data.sessions[0].title : 'Cognitive Behavioral Therapy'} - Today at 2:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Follow-up reminder</p>
                  <p className="text-xs text-muted-foreground">
                    {data.clients.length > 1 ? `${data.clients[1].first_name} ${data.clients[1].last_name}` : 'Client'} due for 30-day follow-up - Tomorrow
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/clients/new'}>
                <Users className="mr-2 h-4 w-4" />
                New Client Intake
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/sessions/new'}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Activity className="mr-2 h-4 w-4" />
                View Reports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                Emergency Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Status */}
      <Card>
        <CardHeader>
          <CardTitle>Active Programs</CardTitle>
          <CardDescription>
            Current recovery programs and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {data.programs.slice(0, 3).map((program) => (
              <div key={program.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{program.name}</h4>
                  <Badge variant="secondary" className={program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {program.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{program.capacity} clients capacity</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${program.success_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 