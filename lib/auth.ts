// Role-based access control utilities

export type UserRole = 'admin' | 'clinical_director' | 'counselor' | 'nurse' | 'therapist' | 'staff';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (!isClient) return null;
  
  try {
    const userStr = localStorage.getItem('user');
    console.log('getCurrentUser - userStr from localStorage:', userStr);
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    console.log('getCurrentUser - parsed user:', user);
    console.log('getCurrentUser - user.is_active:', user.is_active, 'Type:', typeof user.is_active);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  console.log('isAuthenticated - user:', user);
  console.log('isAuthenticated - user.is_active:', user?.is_active, 'Type:', typeof user?.is_active);
  const result = user !== null && user.is_active === true;
  console.log('isAuthenticated - result:', result);
  return result;
};

// Check if user has admin role
export const isAdmin = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Check if user has clinical director role
export const isClinicalDirector = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'clinical_director';
};

// Check if user has counselor role
export const isCounselor = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'counselor';
};

// Check if user has nurse role
export const isNurse = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'nurse';
};

// Check if user has therapist role
export const isTherapist = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'therapist';
};

// Check if user has staff role
export const isStaff = (): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user?.role === 'staff';
};

// Check if user has any of the specified roles
export const hasRole = (roles: UserRole[]): boolean => {
  if (!isClient) return false;
  const user = getCurrentUser();
  return user ? roles.includes(user.role) : false;
};

// Check if user has admin or clinical director role
export const isAdminOrClinicalDirector = (): boolean => {
  return hasRole(['admin', 'clinical_director']);
};

// Check if user has clinical role (counselor, nurse, therapist)
export const hasClinicalRole = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor', 'nurse', 'therapist']);
};

// Check if user can manage users
export const canManageUsers = (): boolean => {
  return hasRole(['admin', 'clinical_director']);
};

// Check if user can manage staff
export const canManageStaff = (): boolean => {
  return hasRole(['admin', 'clinical_director']);
};

// Check if user can manage programs
export const canManagePrograms = (): boolean => {
  return hasRole(['admin', 'clinical_director']);
};

// Check if user can view reports
export const canViewReports = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor']);
};

// Check if user can manage case files
export const canManageCaseFiles = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor', 'therapist']);
};

// Check if user can manage intake
export const canManageIntake = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor', 'nurse']);
};

// Check if user can manage settings
export const canManageSettings = (): boolean => {
  return hasRole(['admin']);
};

// Check if user can delete records
export const canDeleteRecords = (): boolean => {
  return hasRole(['admin', 'clinical_director']);
};

// Check if user can edit records
export const canEditRecords = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor', 'therapist', 'nurse']);
};

// Check if user can view sensitive data
export const canViewSensitiveData = (): boolean => {
  return hasRole(['admin', 'clinical_director', 'counselor', 'nurse']);
};

// Get user's display name
export const getUserDisplayName = (): string => {
  if (!isClient) return 'Unknown User';
  const user = getCurrentUser();
  if (!user) return 'Unknown User';
  return `${user.first_name} ${user.last_name}`;
};

// Get user's role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    admin: 'Administrator',
    clinical_director: 'Clinical Director',
    counselor: 'Counselor',
    nurse: 'Nurse',
    therapist: 'Therapist',
    staff: 'Staff'
  };
  return roleNames[role] || role;
};

// Logout user
export const logout = (): void => {
  if (!isClient) return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = '/login';
}; 