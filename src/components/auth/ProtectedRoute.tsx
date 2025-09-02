'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserType } from '@/generated/prisma';
import { Permission } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserType[];
  permissions?: Permission[];
  requireAll?: boolean; // For permissions: true = ALL, false = ANY
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles,
  permissions,
  requireAll = false,
  redirectTo = '/auth/signin',
  fallback = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { status } = useSession();
  const { user, hasRole, checkAnyPermission, checkAllPermissions } = useAuth();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (status === 'authenticated' && user) {
      // Check role-based access
      if (roles && roles.length > 0) {
        if (!hasRole(roles)) {
          router.push('/unauthorized');
          return;
        }
      }

      // Check permission-based access
      if (permissions && permissions.length > 0) {
        const hasAccess = requireAll
          ? checkAllPermissions(permissions)
          : checkAnyPermission(permissions);
        
        if (!hasAccess) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [status, user, roles, permissions, requireAll, router, redirectTo, hasRole, checkAnyPermission, checkAllPermissions]);

  if (status === 'loading') {
    return <>{fallback}</>;
  }

  if (status === 'authenticated') {
    // Additional checks for roles and permissions
    if (roles && roles.length > 0 && !hasRole(roles)) {
      return null;
    }

    if (permissions && permissions.length > 0) {
      const hasAccess = requireAll
        ? checkAllPermissions(permissions)
        : checkAnyPermission(permissions);
      
      if (!hasAccess) {
        return null;
      }
    }

    return <>{children}</>;
  }

  return null;
}

// Component to conditionally render based on permissions
interface CanProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: UserType | UserType[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({
  permission,
  permissions,
  role,
  requireAll = false,
  children,
  fallback = null,
}: CanProps) {
  const { hasRole, checkPermission, checkAnyPermission, checkAllPermissions } = useAuth();

  // Check role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check single permission
  if (permission && !checkPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? checkAllPermissions(permissions)
      : checkAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    roles?: UserType[];
    permissions?: Permission[];
    requireAll?: boolean;
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        roles={options?.roles}
        permissions={options?.permissions}
        requireAll={options?.requireAll}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
