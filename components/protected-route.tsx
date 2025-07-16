"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { 
  isAuthenticated, 
  getCurrentUser, 
  hasRole, 
  UserRole, 
  logout,
  getRoleDisplayName 
} from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  fallback,
  showAccessDenied = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAccess = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (!isAuthenticated()) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      if (requiredRoles.length === 0) {
        // No role requirements, just need to be authenticated
        setHasAccess(true);
      } else {
        // Check if user has any of the required roles
        setHasAccess(hasRole(requiredRoles));
      }

      setIsLoading(false);
    };

    checkAccess();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAccess();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [requiredRoles, isClient]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess && showAccessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Current Role:</strong> {user ? getRoleDisplayName(user.role) : 'Unknown'}</p>
              {requiredRoles.length > 0 && (
                <p><strong>Required Roles:</strong> {requiredRoles.map(getRoleDisplayName).join(', ')}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => router.back()} 
                className="flex-1"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="flex-1"
              >
                Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess && !showAccessDenied) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for role-based access
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: UserRole[],
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles} fallback={fallback}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Component for conditional rendering based on roles
export function RoleBasedContent({ 
  children, 
  requiredRoles, 
  fallback = null 
}: {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactNode;
}) {
  const hasAccess = hasRole(requiredRoles);
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Component for showing access denied message
export function AccessDenied({ 
  requiredRoles = [],
  message = "You don't have permission to access this feature."
}: {
  requiredRoles?: UserRole[];
  message?: string;
}) {
  const user = getCurrentUser();
  
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Current Role:</strong> {user ? getRoleDisplayName(user.role) : 'Unknown'}</p>
            {requiredRoles.length > 0 && (
              <p><strong>Required Roles:</strong> {requiredRoles.map(getRoleDisplayName).join(', ')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 