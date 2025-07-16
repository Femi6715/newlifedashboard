"use client"
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, User, Shield, Bell, Database, Save, X } from "lucide-react"
import { showSuccess, showError, showLoading, dismissToast } from "@/lib/toast"
import { getCurrentUser } from '@/lib/auth';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [systemOpen, setSystemOpen] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. Sarah',
    lastName: 'McCormick',
    email: 'sarah.mccormick@newlife.com',
    phone: '(555) 123-4567',
    role: 'Clinical Director',
    bio: 'Experienced clinical director with over 10 years in addiction recovery.'
  })

  const [lastLogin, setLastLogin] = useState<string | null>(null);

  // Sync profileData and lastLogin with logged-in user
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setProfileData({
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: '', // Add phone if available in user object
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' '),
        bio: '' // Add bio if available in user object
      });
      setLastLogin(user.last_login || null);
    }
  }, []);

  // Security form state
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: true,
    sessionTimeout: '8',
    passwordExpiry: '90',
    loginNotifications: true
  })

  // Notifications form state
  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    smsAlerts: 'emergency',
    inAppNotifications: true,
    dailyDigest: false,
    weeklyReports: true
  })

  // Preferences form state
  const [preferencesData, setPreferencesData] = useState({
    theme: 'light',
    language: 'english',
    timezone: 'eastern',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })

  const [changePassword, setChangePassword] = useState({
    current: '',
    new: '',
    confirm: '',
    error: '',
    loading: false,
    success: false,
  })

  const { setTheme } = useTheme();

  const handleProfileSave = async () => {
    const loadingToast = showLoading('Saving profile changes...')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Update localStorage user
      const user = getCurrentUser();
      if (user) {
        const updatedUser = {
          ...user,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          email: profileData.email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      dismissToast(loadingToast)
      showSuccess('Profile updated successfully!')
      setEditProfileOpen(false)
    } catch (error) {
      dismissToast(loadingToast)
      showError('Failed to update profile')
    }
  }

  const handleSecuritySave = async () => {
    const loadingToast = showLoading('Saving security settings...')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      dismissToast(loadingToast)
      showSuccess('Security settings updated successfully!')
      setSecurityOpen(false)
    } catch (error) {
      dismissToast(loadingToast)
      showError('Failed to update security settings')
    }
  }

  const handleNotificationsSave = async () => {
    const loadingToast = showLoading('Saving notification preferences...')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      dismissToast(loadingToast)
      showSuccess('Notification preferences updated successfully!')
      setNotificationsOpen(false)
    } catch (error) {
      dismissToast(loadingToast)
      showError('Failed to update notification preferences')
    }
  }

  const handlePreferencesSave = async () => {
    const loadingToast = showLoading('Saving preferences...')
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      dismissToast(loadingToast)
      showSuccess('Preferences updated successfully!')
      setPreferencesOpen(false)
    } catch (error) {
      dismissToast(loadingToast)
      showError('Failed to update preferences')
    }
  }

  const handlePasswordChange = async () => {
    setChangePassword((prev) => ({ ...prev, loading: true, error: '', success: false }))
    if (!changePassword.current || !changePassword.new || !changePassword.confirm) {
      setChangePassword((prev) => ({ ...prev, error: 'All fields are required.', loading: false }))
      return
    }
    if (changePassword.new !== changePassword.confirm) {
      setChangePassword((prev) => ({ ...prev, error: 'New passwords do not match.', loading: false }))
      return
    }
    if (changePassword.new.length < 8) {
      setChangePassword((prev) => ({ ...prev, error: 'Password must be at least 8 characters.', loading: false }))
      return
    }
    // Simulate API call
    const loadingToast = showLoading('Changing password...')
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      dismissToast(loadingToast)
      setChangePassword({ current: '', new: '', confirm: '', error: '', loading: false, success: true })
      showSuccess('Password changed successfully!')
    } catch (error) {
      dismissToast(loadingToast)
      setChangePassword((prev) => ({ ...prev, error: 'Failed to change password.', loading: false }))
      showError('Failed to change password.')
    }
  }

  // Handle theme change and persist
  const handleThemeChange = (value: string) => {
    setPreferencesData(prev => ({ ...prev, theme: value }));
    setTheme(value);
    localStorage.setItem('theme', value);
  };

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
              <p className="text-sm text-muted-foreground">{profileData.firstName} {profileData.lastName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">{profileData.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
            </div>
            <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your personal information and account details.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleProfileSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <p className="text-sm text-muted-foreground">{securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Login</p>
              <p className="text-sm text-muted-foreground">
                {lastLogin ? new Date(lastLogin).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">{securityData.sessionTimeout} hours</p>
            </div>
            <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Security Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Security Settings</DialogTitle>
                  <DialogDescription>
                    Configure your account security preferences.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch
                      id="twoFactor"
                      checked={securityData.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Select value={securityData.sessionTimeout} onValueChange={(value) => setSecurityData(prev => ({ ...prev, sessionTimeout: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Select value={securityData.passwordExpiry} onValueChange={(value) => setSecurityData(prev => ({ ...prev, passwordExpiry: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loginNotifications">Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                    </div>
                    <Switch
                      id="loginNotifications"
                      checked={securityData.loginNotifications}
                      onCheckedChange={(checked) => setSecurityData(prev => ({ ...prev, loginNotifications: checked }))}
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Change Password</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={changePassword.current}
                          onChange={e => setChangePassword(prev => ({ ...prev, current: e.target.value, error: '', success: false }))}
                          autoComplete="current-password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={changePassword.new}
                          onChange={e => setChangePassword(prev => ({ ...prev, new: e.target.value, error: '', success: false }))}
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={changePassword.confirm}
                          onChange={e => setChangePassword(prev => ({ ...prev, confirm: e.target.value, error: '', success: false }))}
                          autoComplete="new-password"
                        />
                      </div>
                      {changePassword.error && (
                        <div className="text-red-600 text-sm">{changePassword.error}</div>
                      )}
                      {changePassword.success && (
                        <div className="text-green-600 text-sm">Password changed successfully!</div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          onClick={handlePasswordChange}
                          disabled={changePassword.loading}
                          variant="secondary"
                        >
                          {changePassword.loading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSecurityOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSecuritySave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <p className="text-sm text-muted-foreground">{notificationData.emailNotifications ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">{notificationData.smsAlerts === 'emergency' ? 'Emergency only' : notificationData.smsAlerts}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">In-App Notifications</p>
              <p className="text-sm text-muted-foreground">{notificationData.inAppNotifications ? 'All enabled' : 'Disabled'}</p>
            </div>
            <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Notification Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                  <DialogDescription>
                    Choose how you want to receive notifications.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationData.emailNotifications}
                      onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsAlerts">SMS Alerts</Label>
                    <Select value={notificationData.smsAlerts} onValueChange={(value) => setNotificationData(prev => ({ ...prev, smsAlerts: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="emergency">Emergency only</SelectItem>
                        <SelectItem value="important">Important alerts</SelectItem>
                        <SelectItem value="all">All notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="inAppNotifications">In-App Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                    </div>
                    <Switch
                      id="inAppNotifications"
                      checked={notificationData.inAppNotifications}
                      onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, inAppNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dailyDigest">Daily Digest</Label>
                      <p className="text-sm text-muted-foreground">Receive daily summary emails</p>
                    </div>
                    <Switch
                      id="dailyDigest"
                      checked={notificationData.dailyDigest}
                      onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, dailyDigest: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                    </div>
                    <Switch
                      id="weeklyReports"
                      checked={notificationData.weeklyReports}
                      onCheckedChange={(checked) => setNotificationData(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleNotificationsSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <p className="text-sm text-muted-foreground">{preferencesData.theme === 'light' ? 'Light' : 'Dark'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Language</p>
              <p className="text-sm text-muted-foreground">{preferencesData.language === 'english' ? 'English' : 'Spanish'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Time Zone</p>
              <p className="text-sm text-muted-foreground">{preferencesData.timezone === 'eastern' ? 'Eastern Time' : 'Central Time'}</p>
            </div>
            <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Preferences
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Preferences</DialogTitle>
                  <DialogDescription>
                    Customize your dashboard experience and display options.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={preferencesData.theme} onValueChange={handleThemeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferencesData.language} onValueChange={(value) => setPreferencesData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={preferencesData.timezone} onValueChange={(value) => setPreferencesData(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eastern">Eastern Time</SelectItem>
                        <SelectItem value="central">Central Time</SelectItem>
                        <SelectItem value="mountain">Mountain Time</SelectItem>
                        <SelectItem value="pacific">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={preferencesData.dateFormat} onValueChange={(value) => setPreferencesData(prev => ({ ...prev, dateFormat: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Select value={preferencesData.timeFormat} onValueChange={(value) => setPreferencesData(prev => ({ ...prev, timeFormat: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12-hour</SelectItem>
                        <SelectItem value="24h">24-hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setPreferencesOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePreferencesSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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