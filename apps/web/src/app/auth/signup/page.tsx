import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';
import RegisterForm from '@/components/auth/register-form';

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  // Redirect if user is already logged in
  if (session) {
    const redirectUrl = session.user.userType === 'EMPLOYER' ? '/employer/dashboard' : '/candidate';
    redirect(redirectUrl);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:hidden">
        <div className="mb-4 flex items-center justify-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <span className="font-bold text-white">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Career Connect</h1>
        </div>
        <p className="text-gray-600">Tạo tài khoản để bắt đầu hành trình nghề nghiệp của bạn.</p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
