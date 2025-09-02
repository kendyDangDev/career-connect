# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This document describes the RBAC implementation for Career Connect platform with three main roles:
- **CANDIDATE**: Job seekers who can browse and apply for jobs
- **EMPLOYER**: Companies/recruiters who can post jobs and manage applications
- **ADMIN**: System administrators with full access

## Architecture

### 1. Permission System
Permissions are defined in `src/types/auth.ts`:

```typescript
export type Permission = 
  | 'job.create' | 'job.edit' | 'job.delete' | 'job.view' | 'job.publish'
  | 'application.create' | 'application.view_own' | 'application.view_all'
  | 'company.create' | 'company.edit' | 'company.verify'
  | 'user.view_all' | 'user.edit_all' | 'user.delete'
  | 'system.manage_settings' | 'system.view_analytics'
  // ... more permissions
```

### 2. Role Permissions Mapping
Each role has specific permissions:

**CANDIDATE**:
- `job.view` - View job listings
- `application.create` - Apply for jobs
- `application.view_own` - View own applications
- `company.create` - Create company (to become employer)

**EMPLOYER**:
- All job-related permissions
- `application.view_all` - View all applications for their jobs
- `company.edit` - Edit their company
- `company.manage_users` - Manage company team

**ADMIN**:
- All permissions in the system

## Usage Examples

### 1. Protecting API Routes

```typescript
// Only employers can create jobs
export const POST = withPermission('job.create', async (req) => {
  // Your handler code
});

// Only admins can access this route
export const GET = withRole(['ADMIN'], async (req) => {
  // Your handler code
});

// Multiple permissions (user needs ANY of these)
export const PUT = withAnyPermission(['job.edit', 'job.manage'], async (req) => {
  // Your handler code
});
```

### 2. Protecting Frontend Routes

```tsx
// Protect entire page
export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <YourComponent />
    </ProtectedRoute>
  );
}

// Protect with specific permissions
<ProtectedRoute permissions={['user.view_all', 'user.edit_all']} requireAll={true}>
  <UserManagement />
</ProtectedRoute>
```

### 3. Conditional UI Rendering

```tsx
// Show/hide UI elements based on permissions
<Can permission="job.create">
  <Button>Create New Job</Button>
</Can>

// Check multiple permissions
<Can permissions={['job.edit', 'job.delete']} requireAll={false}>
  <EditJobForm />
</Can>

// Check role
<Can role="EMPLOYER">
  <EmployerDashboard />
</Can>
```

### 4. Using Hooks

```tsx
function MyComponent() {
  const { user, isEmployer, checkPermission } = useAuth();
  
  if (isEmployer) {
    // Employer-specific logic
  }
  
  if (checkPermission('job.create')) {
    // User can create jobs
  }
}
```

## API Middleware Functions

### `withAuth(handler)`
Ensures user is authenticated.

### `withRole(roles, handler)`
Ensures user has one of the specified roles.

### `withPermission(permission, handler)`
Ensures user has the specific permission.

### `withAnyPermission(permissions, handler)`
Ensures user has at least one of the permissions.

### `withAllPermissions(permissions, handler)`
Ensures user has all of the permissions.

### `withOwnership(checkOwnership, handler)`
Custom ownership validation (e.g., user can only edit their own resources).

## Frontend Components

### `<ProtectedRoute>`
Wraps components that require authentication/authorization.

### `<Can>`
Conditionally renders children based on permissions/roles.

### `withAuth()` HOC
Higher-order component for protecting pages.

## Best Practices

1. **Use specific permissions** rather than role checks when possible
2. **Combine with ownership checks** for resource-specific access
3. **Log all permission-related actions** for audit trails
4. **Handle unauthorized access gracefully** with proper error messages
5. **Test permission boundaries** thoroughly

## Security Considerations

1. **Server-side validation**: Always validate permissions on the server
2. **Audit logging**: Track all administrative actions
3. **Principle of least privilege**: Grant minimal required permissions
4. **Regular reviews**: Periodically review user roles and permissions
5. **Session management**: Implement proper session timeouts

## Testing

Test each role's access:

1. **As CANDIDATE**:
   - ✓ Can view jobs
   - ✓ Can apply for jobs
   - ✗ Cannot create jobs
   - ✗ Cannot access admin panel

2. **As EMPLOYER**:
   - ✓ Can create/edit jobs
   - ✓ Can view applications
   - ✗ Cannot apply for jobs
   - ✗ Cannot manage all users

3. **As ADMIN**:
   - ✓ Full system access
   - ✓ Can manage users
   - ✓ Can verify companies
   - ✓ Can access all areas
