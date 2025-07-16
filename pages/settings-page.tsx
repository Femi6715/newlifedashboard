"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, Shield, Bell, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your recovery center system preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">Dr. Sarah McCormick</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">Clinical Director</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">sarah.mccormick@newlife.com</p>
            </div>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage security settings and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Enabled</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">Today at 9:30 AM</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">8 hours</p>
            </div>
            <Button variant="outline" className="w-full">
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Enabled</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">Emergency only</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-sm text-muted-foreground">All enabled</p>
            </div>
            <Button variant="outline" className="w-full">
              Notification Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              System
            </CardTitle>
            <CardDescription>
              System configuration and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">System Version</p>
              <p className="text-sm text-muted-foreground">v2.1.4</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Backup</p>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-sm text-muted-foreground">67% (2.1 GB)</p>
            </div>
            <Button variant="outline" className="w-full">
              System Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your dashboard experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Light</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Language</p>
              <p className="text-sm text-muted-foreground">English</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Time Zone</p>
              <p className="text-sm text-muted-foreground">Eastern Time</p>
            </div>
            <Button variant="outline" className="w-full">
              Preferences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Support
            </CardTitle>
            <CardDescription>
              Get help and contact support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Support Email</p>
              <p className="text-sm text-muted-foreground">support@newlife.com</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Phone Support</p>
              <p className="text-sm text-muted-foreground">(555) 123-4567</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Documentation</p>
              <p className="text-sm text-muted-foreground">Available online</p>
            </div>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 