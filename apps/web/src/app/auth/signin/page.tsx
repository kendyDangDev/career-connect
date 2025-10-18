import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';
import LoginForm from '@/components/auth/login-form';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // Redirect if user is already logged in
  if (session) {
    const redirectUrl = session.user.userType === 'EMPLOYER' 
      ? '/employer/dashboard' 
      : '/candidate/dashboard';
    redirect(redirectUrl);
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 lg:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Career Connect</h1>
        </div>
        <p className="text-gray-600">
          Chào mừng trở lại! Hãy đăng nhập để tiếp tục.
        </p>
      </div>

      <Suspense 
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
