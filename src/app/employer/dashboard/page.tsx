'use client';

import { ProtectedRoute, Can } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, FileText, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

export default function EmployerDashboard() {
  return (
    // <ProtectedRoute roles={['EMPLOYER']}>
    <div className="container mx-auto p-6">
      <EmployerDashboardContent />
    </div>
    // </ProtectedRoute>
  );
}

function EmployerDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your job postings and review applications.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-muted-foreground text-xs">3 expiring soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-muted-foreground text-xs">24 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates in Pipeline</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-muted-foreground text-xs">12 interviewing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18%</div>
            <p className="text-muted-foreground text-xs">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for employers</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Can permission="job.create">
            <Link href="/employer/jobs/create">
              <Button className="w-full" variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </Link>
          </Can>

          <Can permission="job.manage_applications">
            <Link href="/employer/applications">
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Review Applications
              </Button>
            </Link>
          </Can>

          <Can permission="company.manage_users">
            <Link href="/employer/team">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            </Link>
          </Can>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Job Postings</CardTitle>
          <CardDescription>Your current open positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'Senior Frontend Developer', applications: 23, status: 'active' },
              { title: 'Product Manager', applications: 15, status: 'active' },
              { title: 'UX Designer', applications: 31, status: 'paused' },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-semibold">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.applications} applications</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                  <Can permission="job.edit">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Can>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>What you can do as an Employer</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Create and manage job postings
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Review and manage applications
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-green-500">✓</span>
              Manage company profile and team
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-red-500">✗</span>
              Apply for jobs (Candidate only)
            </li>
            <li className="flex items-center text-sm">
              <span className="mr-2 h-4 w-4 text-red-500">✗</span>
              Access system settings (Admin only)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
