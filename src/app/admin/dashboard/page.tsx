'use client';

import { ProtectedRoute, Can } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, Building2, Activity, Shield, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <div className="container mx-auto p-6">
        <AdminDashboardContent />
      </div>
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System overview and management tools.</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,845</div>
            <p className="text-muted-foreground text-xs">+120 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-muted-foreground text-xs">85% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-muted-foreground text-xs">12 pending verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-muted-foreground text-xs">Uptime last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
          <CardDescription>Administrative functions</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Can permission="user.view_all">
            <Link href="/admin/users">
              <Button className="w-full" variant="default">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
          </Can>

          <Can permission="company.verify">
            <Link href="/admin/companies">
              <Button className="w-full" variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Verify Companies
              </Button>
            </Link>
          </Can>

          <Can permission="system.manage_settings">
            <Link href="/admin/settings">
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </Link>
          </Can>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'User suspended',
                user: 'john.doe@example.com',
                time: '5 minutes ago',
                type: 'warning',
              },
              {
                action: 'Company verified',
                user: 'Tech Corp Inc.',
                time: '1 hour ago',
                type: 'success',
              },
              {
                action: 'Job listing removed',
                user: 'Suspicious Job Post',
                time: '3 hours ago',
                type: 'danger',
              },
              {
                action: 'New admin added',
                user: 'admin2@careerconnect.com',
                time: '1 day ago',
                type: 'info',
              },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Shield
                    className={`h-4 w-4 ${
                      activity.type === 'warning'
                        ? 'text-yellow-500'
                        : activity.type === 'success'
                          ? 'text-green-500'
                          : activity.type === 'danger'
                            ? 'text-red-500'
                            : 'text-blue-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-semibold">{activity.action}</h4>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>What you can do as an Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Full system access and control
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Manage all users and roles
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Verify and manage companies
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Access audit logs and analytics
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Configure system settings
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* System Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>By role type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Candidates</span>
                <span className="text-sm font-medium">2,412 (84.8%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '84.8%' }}></div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">Employers</span>
                <span className="text-sm font-medium">425 (14.9%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '14.9%' }}></div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm">Admins</span>
                <span className="text-sm font-medium">8 (0.3%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-purple-500" style={{ width: '0.3%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Administrative tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Can permission="system.view_audit_logs">
                <Link href="/admin/audit-logs" className="block rounded p-2 hover:bg-gray-100">
                  <div className="text-sm font-medium">Audit Logs</div>
                  <div className="text-xs text-gray-600">View system activity logs</div>
                </Link>
              </Can>

              <Can permission="system.view_analytics">
                <Link href="/admin/analytics" className="block rounded p-2 hover:bg-gray-100">
                  <div className="text-sm font-medium">Analytics</div>
                  <div className="text-xs text-gray-600">System performance metrics</div>
                </Link>
              </Can>

              <Can permission="system.manage_categories">
                <Link href="/admin/categories" className="block rounded p-2 hover:bg-gray-100">
                  <div className="text-sm font-medium">Categories & Skills</div>
                  <div className="text-xs text-gray-600">Manage job categories and skills</div>
                </Link>
              </Can>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
