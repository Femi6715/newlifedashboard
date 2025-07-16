"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  BookOpen,
  LogOut,
  History,
  MessageSquare,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import LogoVector from "@/components/ui/LogoVector"
import { 
  getCurrentUser, 
  canManageUsers, 
  canManageStaff, 
  canViewReports, 
  canManageCaseFiles, 
  canManageIntake, 
  canManageSettings,
  canManagePrograms,
  logout,
  getRoleDisplayName
} from "@/lib/auth"
import { RoleBasedContent } from "./protected-route"
import { useRef } from 'react';
import { useTheme } from "next-themes"
import { useSocket } from "@/components/socket-provider"

interface SidebarItem {
  icon: any;
  label: string;
  key: string;
  href: string;
  requiredRoles?: string[];
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", key: "dashboard", href: "/dashboard" },
  { icon: Users, label: "Clients", key: "clients", href: "/clients" },
  { 
    icon: UserCheck, 
    label: "Staff", 
    key: "staff", 
    href: "/staff",
    requiredRoles: ['admin', 'clinical_director']
  },
  { 
    icon: MessageSquare, 
    label: "Note Board", 
    key: "post-board", 
    href: "/post-board"
  },
  { 
    icon: Users, 
    label: "Users", 
    key: "users", 
    href: "/users",
    requiredRoles: ['admin']
  },
  { icon: Calendar, label: "Sessions", key: "sessions", href: "/sessions" },
  { 
    icon: BookOpen, 
    label: "Programs", 
    key: "programs", 
    href: "/programs",
    requiredRoles: ['admin', 'clinical_director']
  },
  { 
    icon: Users, 
    label: "Program Assignments", 
    key: "program-assignments", 
    href: "/program-assignments",
    requiredRoles: ['admin', 'clinical_director']
  },
  { 
    icon: BarChart3, 
    label: "Reports", 
    key: "reports", 
    href: "/reports",
    requiredRoles: ['admin', 'clinical_director', 'counselor']
  },
  { 
    icon: FileText, 
    label: "Case Files", 
    key: "case-files", 
    href: "/case-files",
    requiredRoles: ['admin', 'clinical_director', 'counselor', 'therapist']
  },
  { 
    icon: Phone, 
    label: "24/7 Intake", 
    key: "intake", 
    href: "/intake",
    requiredRoles: ['admin', 'clinical_director', 'counselor', 'nurse']
  },
  { 
    icon: History, 
    label: "Activity Log", 
    key: "activity-log", 
    href: "/activity-log",
    requiredRoles: ['admin', 'clinical_director']
  },
  { 
    icon: Settings, 
    label: "Settings", 
    key: "settings", 
    href: "/settings"
  },
]

function Sidebar({
  className,
}: {
  className?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(getCurrentUser())
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true);
  }, [])

  useEffect(() => {
    if (!isClient) return;
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [isClient])

  const getActiveSection = () => {
    if (!pathname || pathname === "/") return "dashboard"
    return pathname.split("/")[1] || "dashboard"
  }

  const activeSection = getActiveSection()

  const handleLogout = () => {
    logout()
  }

  const canAccessItem = (item: SidebarItem) => {
    if (!item.requiredRoles) return true
    if (!user) return false
    return item.requiredRoles.includes(user.role)
  }

  const filteredItems = sidebarItems.filter(canAccessItem)

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-2">
          <LogoVector className="h-8 w-8" />
          <div>
            <h2 className="text-lg font-semibold">NewLife RC</h2>
            <p className="text-sm text-muted-foreground">A New Beginning in Recovery</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {isClient && user && (
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <Button
                variant={activeSection === item.key ? "secondary" : "ghost"}
                className="w-full justify-start h-10"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="flex-shrink-0 p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

// Helper function to format relative time
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Extracted BellDropdown component for reuse
function BellDropdown({
  isClient, user, notificationRef, handleOpenNotifications, hasUnseen, showNotifications, newPosts, newReplies
}: any) {
  return (
    isClient && user && (
      <div className="relative" ref={notificationRef}>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={handleOpenNotifications} aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {hasUnseen && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />}
        </Button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded shadow-lg z-50">
            {newPosts.length === 0 && newReplies.length === 0 ? (
              <div className="p-4 text-muted-foreground text-sm">No new notes or replies</div>
            ) : (
              <>
                {newPosts.length > 0 && (
                  <>
                    <div className="p-4 font-semibold border-b border-border">New Notes</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {newPosts.map((post: any) => (
                        <li key={post.id} className="p-4 border-b border-border last:border-b-0">
                          <div className="text-sm">
                            <span className="font-medium">{post.author_name}</span>
                            <span className="text-muted-foreground"> posted on note board</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getRelativeTime(post.created_at)}
                          </div>
                          <Link href={`/post-board`} className="text-blue-600 hover:underline text-xs mt-2 inline-block">View Note Board</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {newReplies.length > 0 && (
                  <>
                    <div className="p-4 font-semibold border-b border-border">New Replies</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {newReplies.map((reply: any) => (
                        <li key={reply.id} className="p-4 border-b border-border last:border-b-0">
                          <div className="text-sm">
                            <span className="font-medium">{reply.author_name}</span>
                            <span className="text-muted-foreground"> replied to a note</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getRelativeTime(reply.created_at)}
                          </div>
                          <Link href={`/post-board`} className="text-blue-600 hover:underline text-xs mt-2 inline-block">View Note Board</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    )
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const [userFirstName, setUserFirstName] = useState<string | null>(null)
  const [user, setUser] = useState(getCurrentUser())
  const [isClient, setIsClient] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [newPosts, setNewPosts] = useState<any[]>([])
  const [newReplies, setNewReplies] = useState<any[]>([])
  const [hasUnseen, setHasUnseen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const socket = useSocket();

  useEffect(() => {
    setIsClient(true);
  }, [])

  useEffect(() => {
    if (!isClient) return;
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setUserFirstName(currentUser?.first_name || null)
  }, [isClient])

  // Fetch new posts and replies for notification bell
  useEffect(() => {
    if (!user) return;
    const fetchNewContent = async () => {
      try {
        // Get last seen timestamp from localStorage
        const lastSeen = localStorage.getItem('post-bell-last-seen')
        const token = btoa(JSON.stringify(user))
        
        // Fetch posts
        const postsRes = await fetch('/api/post-board/optimized', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const postsData = await postsRes.json()
        
        // Fetch replies for all posts
        const repliesRes = await fetch('/api/post-board/replies', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const repliesData = await repliesRes.json()
        
        if (Array.isArray(postsData.posts)) {
          let unseenPosts = postsData.posts
          if (lastSeen) {
            unseenPosts = unseenPosts.filter((post: any) => new Date(post.created_at) > new Date(lastSeen))
          }
          setNewPosts(unseenPosts)
        }
        
        if (Array.isArray(repliesData.replies)) {
          let unseenReplies = repliesData.replies
          if (lastSeen) {
            unseenReplies = unseenReplies.filter((reply: any) => new Date(reply.created_at) > new Date(lastSeen))
          }
          setNewReplies(unseenReplies)
        }
        
        const totalUnseen = (Array.isArray(postsData.posts) ? postsData.posts.filter((post: any) => lastSeen ? new Date(post.created_at) > new Date(lastSeen) : true).length : 0) +
                           (Array.isArray(repliesData.replies) ? repliesData.replies.filter((reply: any) => lastSeen ? new Date(reply.created_at) > new Date(lastSeen) : true).length : 0)
        setHasUnseen(totalUnseen > 0)
      } catch (e) {
        setNewPosts([])
        setNewReplies([])
        setHasUnseen(false)
      }
    }
    fetchNewContent()
  }, [user, showNotifications])

  // Listen for real-time note/reply events
  useEffect(() => {
    if (!socket || !user) return;
    const handleRealtimeUpdate = () => {
      // Refetch new content when a new note or reply is received
      const fetchNewContent = async () => {
        try {
          const lastSeen = localStorage.getItem('post-bell-last-seen')
          const token = btoa(JSON.stringify(user))
          
          // Fetch posts
          const postsRes = await fetch('/api/post-board/optimized', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const postsData = await postsRes.json()
          
          // Fetch replies for all posts
          const repliesRes = await fetch('/api/post-board/replies', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const repliesData = await repliesRes.json()
          
          if (Array.isArray(postsData.posts)) {
            let unseenPosts = postsData.posts
            if (lastSeen) {
              unseenPosts = unseenPosts.filter((post: any) => new Date(post.created_at) > new Date(lastSeen))
            }
            setNewPosts(unseenPosts)
          }
          
          if (Array.isArray(repliesData.replies)) {
            let unseenReplies = repliesData.replies
            if (lastSeen) {
              unseenReplies = unseenReplies.filter((reply: any) => new Date(reply.created_at) > new Date(lastSeen))
            }
            setNewReplies(unseenReplies)
          }
          
          const totalUnseen = (Array.isArray(postsData.posts) ? postsData.posts.filter((post: any) => lastSeen ? new Date(post.created_at) > new Date(lastSeen) : true).length : 0) +
                             (Array.isArray(repliesData.replies) ? repliesData.replies.filter((reply: any) => lastSeen ? new Date(reply.created_at) > new Date(lastSeen) : true).length : 0)
          setHasUnseen(totalUnseen > 0)
        } catch (e) {
          setNewPosts([])
          setNewReplies([])
          setHasUnseen(false)
        }
      }
      fetchNewContent()
    }
    socket.on('new_note', handleRealtimeUpdate)
    socket.on('new_reply', handleRealtimeUpdate)
    return () => {
      socket.off('new_note', handleRealtimeUpdate)
      socket.off('new_reply', handleRealtimeUpdate)
    }
  }, [socket, user])

  // Mark notifications as seen when dropdown closes
  const prevShowNotifications = useRef(showNotifications);
  useEffect(() => {
    if (prevShowNotifications.current && !showNotifications) {
      localStorage.setItem('post-bell-last-seen', new Date().toISOString());
      setHasUnseen(false);
    }
    prevShowNotifications.current = showNotifications;
  }, [showNotifications]);

  // Mark notifications as seen
  const handleOpenNotifications = () => {
    setShowNotifications((prev) => !prev);
  }

  // Close notification dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const getActiveSection = () => {
    if (!pathname || pathname === "/") return "dashboard"
    return pathname.split("/")[1] || "dashboard"
  }

  const activeSection = getActiveSection()

  const canAccessItem = (item: SidebarItem) => {
    if (!item.requiredRoles) return true
    if (!user) return false
    return item.requiredRoles.includes(user.role)
  }

  const filteredItems = sidebarItems.filter(canAccessItem)

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed left-0 top-0 h-screen z-50">
        <div className="flex flex-col h-full bg-background text-foreground border-r border-border">
          <Sidebar />
        </div>
      </div>

      {/* Desktop Top Bar with Notification Bell */}
      <div className="hidden md:flex fixed top-0 left-64 right-0 h-16 z-50 bg-background border-b border-border items-center justify-end pr-8">
        <BellDropdown
          isClient={isClient}
          user={user}
          notificationRef={notificationRef}
          handleOpenNotifications={handleOpenNotifications}
          hasUnseen={hasUnseen}
          showNotifications={showNotifications}
          newPosts={newPosts}
          newReplies={newReplies}
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background text-foreground border-b border-border h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-2">
            <LogoVector className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold">NewLife RC</h1>
              <p className="text-xs text-muted-foreground">A New Beginning in Recovery</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BellDropdown
              isClient={isClient}
              user={user}
              notificationRef={notificationRef}
              handleOpenNotifications={handleOpenNotifications}
              hasUnseen={hasUnseen}
              showNotifications={showNotifications}
              newPosts={newPosts}
              newReplies={newReplies}
            />
            {isClient && user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Welcome,</span>
                <span className="font-medium">{userFirstName}</span>
                <Badge variant="secondary" className="text-xs">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-background text-foreground border-r border-border">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 min-h-screen">
        {/* Content will be rendered here by pages */}
      </div>
    </>
  )
} 