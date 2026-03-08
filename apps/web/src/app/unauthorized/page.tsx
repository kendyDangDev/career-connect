'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isCandidate, isEmployer, isAdmin } = useAuth();

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isEmployer) return '/employer/dashboard';
    if (isCandidate) return '/candidate';
    return '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don't have permission to access this page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p>This page requires specific permissions that your account doesn't have.</p>
            {user && (
              <p className="mt-2">
                Your current role: <span className="font-semibold">{user.userType}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              Go Back
            </Button>

            <Link href={getDashboardLink()}>
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </div>

          <div className="border-t pt-4 text-center text-xs text-gray-500">
            If you believe this is an error, please contact system administrator.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
