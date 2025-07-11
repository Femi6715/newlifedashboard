"use client"
import {
  Activity,
  Calendar,
  Home,
  Menu,
  Plus,
  Settings,
  Users,
  UserCheck,
  AlertCircle,
  CheckCircle,
  BarChart3,
  FileText,
  Bell,
  Shield,
  BookOpen,
  Phone,
  Heart,
  Star,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Users, label: "Clients" },
  { icon: UserCheck, label: "Staff" },
  { icon: Calendar, label: "Sessions" },
  { icon: Activity, label: "Programs" },
  { icon: BarChart3, label: "Reports" },
  { icon: FileText, label: "Case Files" },
  { icon: Phone, label: "24/7 Intake" },
  { icon: Settings, label: "Settings" },
]

const detailedClients = [
  {
    name: "Sarah Johnson",
    id: "NL001",
    status: "Active",
    progress: 75,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Transitional Housing Unit B",
    admissionDate: "2024-01-15",
    daysSince: 28,
    sobrietyDays: 45,
    familyStatus: "Rebuilding Relationship with Children",
    reasonForRehab: "Opioid addiction - court-mandated treatment",
    currentLevel: "Level 2 - IOP",
    currentPhase: "Intensive Outpatient Program",
    counselor: "Maria Rodriguez, LCPC",
    emergencyContact: "John Johnson (Brother)",
    programType: "Intensive Outpatient Program (IOP)",
    nextSession: "Today 2:00 PM - Group Therapy",
    riskLevel: "Medium",
    priorAttempts: 2,
    covidTested: "2024-02-08",
    dualDiagnosis: "Depression, Anxiety",
    retentionStatus: "On Track",
  },
  {
    name: "Michael Chen",
    id: "NL002",
    status: "Graduated",
    progress: 100,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Independent Living",
    admissionDate: "2023-12-01",
    daysSince: 73,
    sobrietyDays: 120,
    familyStatus: "Family Sessions Completed",
    reasonForRehab: "Alcohol dependency - voluntary admission",
    currentLevel: "Aftercare Support",
    currentPhase: "Relapse Prevention",
    counselor: "James Miller, LCSW",
    emergencyContact: "Anna Chen (Daughter)",
    programType: "Completed Residential Services (3.1)",
    nextSession: "Monthly Check-in Scheduled",
    riskLevel: "Low",
    priorAttempts: 1,
    covidTested: "2024-02-05",
    dualDiagnosis: "None",
    retentionStatus: "Success Story",
  },
  {
    name: "Emily Davis",
    id: "NL003",
    status: "New Intake",
    progress: 15,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Residential Services 3.3",
    admissionDate: "2024-02-10",
    daysSince: 3,
    sobrietyDays: 5,
    familyStatus: "Family Therapy Scheduled",
    reasonForRehab: "Methamphetamine addiction - Treatment on Demand",
    currentLevel: "Level 3 - Residential",
    currentPhase: "Withdrawal Management/Detox",
    counselor: "Dr. Lisa Park, MD",
    emergencyContact: "Robert Davis (Father)",
    programType: "Residential Services (3.3)",
    nextSession: "Tomorrow 10:00 AM - Individual Counseling",
    riskLevel: "High",
    priorAttempts: 0,
    covidTested: "2024-02-10",
    dualDiagnosis: "Bipolar Disorder",
    retentionStatus: "Early Stage",
  },
  {
    name: "Robert Wilson",
    id: "NL004",
    status: "Active",
    progress: 60,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Transitional Housing Unit A",
    admissionDate: "2024-01-22",
    daysSince: 21,
    sobrietyDays: 35,
    familyStatus: "Individual Sessions Only",
    reasonForRehab: "Cocaine addiction - PRP Adult Program",
    currentLevel: "Level 2 - PHP",
    currentPhase: "Partial Hospitalization Program (2.5)",
    counselor: "Mark Thompson, LCADC",
    emergencyContact: "Susan Wilson (Sister)",
    programType: "Psychiatric Rehabilitation Program (PRP)",
    nextSession: "Today 4:30 PM - Crisis Management Skills",
    riskLevel: "Medium",
    priorAttempts: 1,
    covidTested: "2024-02-07",
    dualDiagnosis: "PTSD, Substance Abuse",
    retentionStatus: "Stable Progress",
  },
  {
    name: "Maria Garcia",
    id: "NL005",
    status: "At Risk",
    progress: 40,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Residential Services 3.1",
    admissionDate: "2024-02-05",
    daysSince: 8,
    sobrietyDays: 15,
    familyStatus: "Family Reunification Program",
    reasonForRehab: "Alcohol addiction - CPS involvement",
    currentLevel: "Level 3 - Residential",
    currentPhase: "Intensive Counseling & Family Sessions",
    counselor: "Dr. Amanda Rodriguez, PhD",
    emergencyContact: "Carmen Garcia (Mother/Guardian)",
    programType: "Residential Services with Family Component",
    nextSession: "Daily individual and group sessions",
    riskLevel: "High",
    priorAttempts: 3,
    covidTested: "2024-02-09",
    dualDiagnosis: "Depression, Substance Abuse",
    retentionStatus: "Intervention Needed",
  },
  {
    name: "David Brown",
    id: "NL006",
    status: "Active",
    progress: 85,
    avatar: "/placeholder.svg?height=32&width=32",
    housing: "Transitional Housing - Phase 2",
    admissionDate: "2023-12-20",
    daysSince: 54,
    sobrietyDays: 78,
    familyStatus: "Family Sessions Ongoing",
    reasonForRehab: "Alcohol addiction - multiple DUI arrests",
    currentLevel: "Level 1 - OP",
    currentPhase: "Outpatient Program with Ancillary Services",
    counselor: "James Miller, LCSW",
    emergencyContact: "Margaret Brown (Sister)",
    programType: "Outpatient Program (OP)",
    nextSession: "Today 11:00 AM - Motivational Enhancement Therapy",
    riskLevel: "Low",
    priorAttempts: 2,
    covidTested: "2024-02-06",
    dualDiagnosis: "Anxiety Disorder",
    retentionStatus: "Excellent Progress",
  },
]

const staffMembers = [
  {
    name: "Vennieth L. McCormick",
    role: "Founder/Executive Director",
    status: "Available",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Program Leadership",
    credentials: "Executive Director",
  },
  {
    name: "Dr. Amanda Rodriguez",
    role: "Clinical Director",
    status: "Available",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Dual Diagnosis",
    credentials: "PhD, LCPC",
  },
  {
    name: "Mark Thompson",
    role: "Addiction Counselor",
    status: "With Client",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Crisis Management",
    credentials: "LCADC, CADC",
  },
  {
    name: "Dr. Lisa Park",
    role: "Medical Director",
    status: "Available",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Withdrawal Management",
    credentials: "MD, Addiction Medicine",
  },
  {
    name: "James Miller",
    role: "Clinical Therapist",
    status: "In Session",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Motivational Enhancement",
    credentials: "LCSW, LCPC",
  },
  {
    name: "Maria Rodriguez",
    role: "Family Therapist",
    status: "Available",
    avatar: "/placeholder.svg?height=32&width=32",
    specialty: "Family Systems",
    credentials: "LCPC, LMFT",
  },
]

const upcomingSessions = [
  { client: "Sarah Johnson", counselor: "Maria Rodriguez", time: "9:00 AM", type: "IOP Group Session" },
  { client: "David Brown", counselor: "James Miller", time: "10:30 AM", type: "Motivational Enhancement" },
  { client: "Emily Davis", counselor: "Dr. Lisa Park", time: "2:00 PM", type: "Individual Counseling" },
  { client: "Robert Wilson", counselor: "Mark Thompson", time: "3:30 PM", type: "Crisis Management Skills" },
  { client: "Maria Garcia", counselor: "Dr. Rodriguez", time: "4:00 PM", type: "Family Session" },
]

const programStats = [
  { name: "IOP", clients: 18, capacity: 25 },
  { name: "OP", clients: 12, capacity: 20 },
  { name: "PRP Adults", clients: 8, capacity: 15 },
  { name: "Residential 3.1", clients: 6, capacity: 8 },
  { name: "PHP 2.5", clients: 4, capacity: 6 },
  { name: "Transitional Housing", clients: 10, capacity: 12 },
]

function Sidebar({ className }: { className?: string }) {
  return (
    <div className={`pb-12 ${className}`}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-8 w-8 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold">NewLife RC</h2>
              <p className="text-sm text-muted-foreground">A New Beginning in Recovery</p>
            </div>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button key={item.label} variant={item.active ? "secondary" : "ghost"} className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <Sidebar className="w-full" />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NewLife Recovery Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, Director McCormick</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Phone className="mr-1 h-3 w-3" />
                24/7 Intake Active
              </Badge>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>VM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">58</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">72%</span> retention rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Program Levels</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Level 1, 2, 3 services active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dual Accreditation</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✓</div>
                <p className="text-xs text-muted-foreground">Baltimore City certified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">COVID Testing</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14</div>
                <p className="text-xs text-muted-foreground">day mobile testing cycle</p>
              </CardContent>
            </Card>
          </div>

          {/* Program Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Program Capacity Overview</CardTitle>
              <CardDescription>Current enrollment across all NewLife RC programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {programStats.map((program) => (
                  <div key={program.name} className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-sm">{program.name}</h3>
                    <div className="text-2xl font-bold text-green-600 mt-2">
                      {program.clients}/{program.capacity}
                    </div>
                    <Progress value={(program.clients / program.capacity) * 100} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((program.clients / program.capacity) * 100)}% capacity
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Client Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Client Progress</CardTitle>
                    <CardDescription>Latest milestones and program updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailedClients.slice(0, 4).map((client) => (
                      <div key={client.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.sobrietyDays} days sober • {client.currentLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              client.status === "Graduated"
                                ? "default"
                                : client.status === "Active"
                                  ? "secondary"
                                  : client.status === "At Risk"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {client.status}
                          </Badge>
                          <div className="w-16">
                            <Progress value={client.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Today's Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Sessions</CardTitle>
                    <CardDescription>Individual, group, and family sessions scheduled</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{session.client}</p>
                          <p className="text-xs text-muted-foreground">{session.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.time}</p>
                          <p className="text-xs text-muted-foreground">{session.counselor}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* NewLife RC Mission */}
              <Card>
                <CardHeader>
                  <CardTitle>NewLife Recovery Center Mission</CardTitle>
                  <CardDescription>
                    "Our success depends on how we assist others with managing life's situations"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold mb-3">Why NewLife RC?</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Dually accredited with 72% retention rate
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          24-hour intake line including weekends
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Mobile COVID-19 testing every 14 days
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Individual, group, and family sessions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Three levels of care (1, 2, 3)
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">You Are Not Alone</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        2.4 million Americans are currently in recovery, living their lives without dependence on drugs
                        or alcohol after struggling with addiction.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        There are many paths to recovery - one size does not fit all. Reach out for help, there are
                        people waiting to support your recovery.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>Comprehensive client records across all NewLife RC programs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      24/7 Intake
                    </Button>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Admission
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {detailedClients.map((client) => (
                      <Card
                        key={client.id}
                        className={`border-l-4 ${
                          client.riskLevel === "High"
                            ? "border-l-red-500"
                            : client.riskLevel === "Medium"
                              ? "border-l-yellow-500"
                              : "border-l-green-500"
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="grid gap-6 lg:grid-cols-3">
                            {/* Client Basic Info */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={client.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-lg">
                                    {client.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-semibold">{client.name}</h3>
                                  <p className="text-sm text-muted-foreground">Client ID: {client.id}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        client.status === "Graduated"
                                          ? "default"
                                          : client.status === "Active"
                                            ? "secondary"
                                            : client.status === "At Risk"
                                              ? "destructive"
                                              : "outline"
                                      }
                                    >
                                      {client.status}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {client.retentionStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Housing:</span>
                                  <span className="font-medium">{client.housing}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Admitted:</span>
                                  <span className="font-medium">{client.admissionDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Days in Program:</span>
                                  <span className="font-medium">{client.daysSince} days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Sobriety:</span>
                                  <span className="font-medium text-green-600">{client.sobrietyDays} days</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">COVID Test:</span>
                                  <span className="font-medium">{client.covidTested}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Prior Attempts:</span>
                                  <span className="font-medium">{client.priorAttempts}</span>
                                </div>
                              </div>
                            </div>

                            {/* Program Details */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Program Information</h4>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm text-muted-foreground">Reason for Admission:</span>
                                    <p className="text-sm font-medium mt-1">{client.reasonForRehab}</p>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Program Type:</span>
                                    <span className="font-medium">{client.programType}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current Level:</span>
                                    <span className="font-medium">{client.currentLevel}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Current Phase:</span>
                                    <span className="font-medium">{client.currentPhase}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Counselor:</span>
                                    <span className="font-medium">{client.counselor}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Dual Diagnosis:</span>
                                    <span className="font-medium">{client.dualDiagnosis}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <span className="text-sm text-muted-foreground">Program Progress</span>
                                <Progress value={client.progress} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-1">{client.progress}% Complete</p>
                              </div>
                            </div>

                            {/* Support & Family */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Support Network</h4>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm text-muted-foreground">Family Status:</span>
                                    <p className="text-sm font-medium mt-1">{client.familyStatus}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm text-muted-foreground">Emergency Contact:</span>
                                    <p className="text-sm font-medium mt-1">{client.emergencyContact}</p>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Next Session:</span>
                                    <span className="font-medium">{client.nextSession}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Case File
                                </Button>
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Schedule Session
                                </Button>
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                  <Users className="mr-2 h-4 w-4" />
                                  Family Sessions
                                </Button>
                                <Button variant="outline" size="sm" className="w-full bg-transparent">
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Treatment Plan
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>NewLife RC Staff</CardTitle>
                  <CardDescription>
                    Professional team using cognitive behavioral methods and motivational enhancement therapy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {staffMembers.map((staff, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {staff.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{staff.name}</h3>
                            <p className="text-sm text-muted-foreground">{staff.role}</p>
                            <p className="text-xs text-muted-foreground">
                              {staff.credentials} • {staff.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {staff.status === "Available" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {staff.status !== "Available" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          <Badge variant={staff.status === "Available" ? "default" : "secondary"}>{staff.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Session Schedule</CardTitle>
                    <CardDescription>Individual, group, and family sessions across all programs</CardDescription>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{session.time}</p>
                            <p className="text-xs text-muted-foreground">Today</p>
                          </div>
                          <div>
                            <h3 className="font-medium">{session.client}</h3>
                            <p className="text-sm text-muted-foreground">{session.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{session.counselor}</p>
                            <p className="text-xs text-muted-foreground">Counselor</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
