import { useSession } from 'next-auth/react';
import { UserType } from '@/generated/prisma';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/auth';

export function useAuth() {
  const { data: session, status } = useSession();
  
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const isLoading = status === 'loading';
  const user = session?.user;
  
  const checkPermission = (permission: Permission): boolean => {
    if (!user?.userType) return false;
    return hasPermission(user.userType, permission);
  };
  
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user?.userType) return false;
    return hasAnyPermission(user.userType, permissions);
  };
  
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user?.userType) return false;
    return hasAllPermissions(user.userType, permissions);
  };
  
  const hasRole = (role: UserType | UserType[]): boolean => {
    if (!user?.userType) return false;
    if (Array.isArray(role)) {
      return role.includes(user.userType);
    }
    return user.userType === role;
  };
  
  const isCandidate = user?.userType === 'CANDIDATE';
  const isEmployer = user?.userType === 'EMPLOYER';
  const isAdmin = user?.userType === 'ADMIN';
  
  return {
    user,
    isAuthenticated,
    isLoading,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    hasRole,
    isCandidate,
    isEmployer,
    isAdmin,
  };
}

// Hook to check a specific permission
export function usePermission(permission: Permission): boolean {
  const { checkPermission } = useAuth();
  return checkPermission(permission);
}

// Hook to check multiple permissions (ANY)
export function useAnyPermission(permissions: Permission[]): boolean {
  const { checkAnyPermission } = useAuth();
  return checkAnyPermission(permissions);
}

// Hook to check multiple permissions (ALL)
export function useAllPermissions(permissions: Permission[]): boolean {
  const { checkAllPermissions } = useAuth();
  return checkAllPermissions(permissions);
}

// Hook to check role
export function useRole(role: UserType | UserType[]): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}
