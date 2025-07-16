"use client"
import { useState, useEffect } from "react"
import {
  Activity,
  Calendar,
  Home,
  Menu,
  Settings,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Bell,
  Phone,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import LogoVector from "@/components/ui/LogoVector"

// Import all page components
import DashboardOverview from "./pages/dashboard-overview"
import ClientsPage from "./pages/clients-page"
import StaffPage from "./pages/staff-page"
import SessionsPage from "./pages/sessions-page"
import ProgramsPage from "./pages/programs-page"
import ReportsPage from "./pages/reports-page"
import CaseFilesPage from "./pages/case-files-page"
import IntakePage from "./pages/intake-page"
import SettingsPage from "./pages/settings-page"

const sidebarItems = [
  { icon: Home, label: "Dashboard", key: "dashboard" },
  { icon: Users, label: "Clients", key: "clients" },
  { icon: UserCheck, label: "Staff", key: "staff" },
  { icon: Calendar, label: "Sessions", key: "sessions" },
  { icon: Activity, label: "Programs", key: "programs" },
  { icon: BarChart3, label: "Reports", key: "reports" },
  { icon: FileText, label: "Case Files", key: "case-files" },
  { icon: Phone, label: "24/7 Intake", key: "intake" },
  { icon: Settings, label: "Settings", key: "settings" },
]

function Sidebar({
  className,
  activeSection,
  setActiveSection,
}: {
  className?: string
  activeSection: string
  setActiveSection: (section: string) => void
}) {
  return (
    <div className={`pb-12 ${className}`}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-6">
            <LogoVector className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-semibold">NewLife RC</h2>
              <p className="text-sm text-muted-foreground">A New Beginning in Recovery</p>
            </div>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(item.key)}
              >
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
  const [activeSection, setActiveSection] = useState("dashboard")
  const [userFirstName, setUserFirstName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setUserFirstName(user.first_name || null)
      } catch {
        setUserFirstName(null)
      }
    }
  }, [])

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "clients":
        return <ClientsPage />
      case "staff":
        return <StaffPage />
      case "sessions":
        return <SessionsPage />
      case "programs":
        return <ProgramsPage />
      case "reports":
        return <ReportsPage />
      case "case-files":
        return <CaseFilesPage />
      case "intake":
        return <IntakePage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
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
                  <Sidebar className="w-full" activeSection={activeSection} setActiveSection={setActiveSection} />
                </SheetContent>
              </Sheet>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  NewLife Recovery - {sidebarItems.find((item) => item.key === activeSection)?.label}
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back{userFirstName ? `, ${userFirstName}` : ''}
                </p>
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

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
