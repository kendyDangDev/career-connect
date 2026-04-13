import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { authOptions } from '@/lib/auth-config';
import LoginForm from '@/components/auth/login-form';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  // Redirect if user is already logged in
  if (session) {
    const redirectUrl = session.user.userType === 'EMPLOYER' ? '/employer/dashboard' : '/candidate';
    redirect(redirectUrl);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:hidden">
        <BrandLogo
          size={40}
          priority
          className="mb-4 justify-center"
          labelClassName="text-2xl font-bold text-gray-900"
        />
        <p className="text-gray-600">Chào mừng trở lại! Hãy đăng nhập để tiếp tục.</p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
