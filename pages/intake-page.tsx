"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Clock, AlertCircle, CheckCircle } from "lucide-react"

export default function IntakePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">24/7 Intake</h2>
          <p className="text-muted-foreground">
            Manage emergency intake calls and admissions
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Phone className="mr-2 h-4 w-4" />
          Emergency Hotline Active
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 emergency, 5 inquiries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Admissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Response</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Active emergencies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Calls handled successfully
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Intake Calls</CardTitle>
            <CardDescription>
              Latest emergency and inquiry calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Emergency Call - John Doe</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago - Immediate admission needed</p>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Emergency
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Inquiry Call - Sarah Smith</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago - Information request</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Inquiry
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Admission Complete - Mike Johnson</p>
                  <p className="text-xs text-muted-foreground">1 hour ago - Successfully admitted</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intake Process</CardTitle>
            <CardDescription>
              Step-by-step intake workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                  1
                </div>
                <span className="text-sm">Initial Call Assessment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                  2
                </div>
                <span className="text-sm">Emergency Evaluation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                  3
                </div>
                <span className="text-sm">Insurance Verification</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                  4
                </div>
                <span className="text-sm">Admission Scheduling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                  5
                </div>
                <span className="text-sm">Transportation Arrangement</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Start New Intake
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
          <CardDescription>
            Quick access to emergency resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Phone className="h-6 w-6 mb-2" />
              <span>911 Emergency</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertCircle className="h-6 w-6 mb-2" />
              <span>Crisis Hotline</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span>Medical Transport</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 