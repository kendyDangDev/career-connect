import { UserType } from '@/generated/prisma';

// Permission types
export type Permission = 
  // Job permissions
  | 'job.create'
  | 'job.edit'
  | 'job.delete'
  | 'job.view'
  | 'job.publish'
  | 'job.manage_applications'
  
  // Application permissions
  | 'application.create'
  | 'application.view_own'
  | 'application.view_all'
  | 'application.update_status'
  | 'application.delete'
  
  // Company permissions
  | 'company.create'
  | 'company.edit'
  | 'company.delete'
  | 'company.verify'
  | 'company.manage_users'
  
  // User permissions
  | 'user.view_all'
  | 'user.edit_all'
  | 'user.delete'
  | 'user.suspend'
  | 'user.change_role'
  
  // System permissions
  | 'system.manage_settings'
  | 'system.view_analytics'
  | 'system.view_audit_logs'
  | 'system.manage_categories'
  | 'system.manage_skills';

// Role permissions mapping
export const rolePermissions: Record<UserType, Permission[]> = {
  CANDIDATE: [
    'job.view',
    'application.create',
    'application.view_own',
    'company.create', // Candidates can create company profiles to become employers
  ],
  
  EMPLOYER: [
    'job.create',
    'job.edit',
    'job.delete',
    'job.view',
    'job.publish',
    'job.manage_applications',
    'application.view_all', // View all applications for their jobs
    'application.update_status',
    'company.edit', // Edit their own company
    'company.manage_users', // Manage users in their company
  ],
  
  ADMIN: [
    // All permissions
    'job.create',
    'job.edit',
    'job.delete',
    'job.view',
    'job.publish',
    'job.manage_applications',
    'application.create',
    'application.view_own',
    'application.view_all',
    'application.update_status',
    'application.delete',
    'company.create',
    'company.edit',
    'company.delete',
    'company.verify',
    'company.manage_users',
    'user.view_all',
    'user.edit_all',
    'user.delete',
    'user.suspend',
    'user.change_role',
    'system.manage_settings',
    'system.view_analytics',
    'system.view_audit_logs',
    'system.manage_categories',
    'system.manage_skills',
  ],
};

// Helper function to check if a role has a specific permission
export function hasPermission(userType: UserType, permission: Permission): boolean {
  return rolePermissions[userType].includes(permission);
}

// Helper function to check if a user has any of the specified permissions
export function hasAnyPermission(userType: UserType, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userType, permission));
}

// Helper function to check if a user has all of the specified permissions
export function hasAllPermissions(userType: UserType, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userType, permission));
}
