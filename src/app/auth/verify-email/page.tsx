import { Suspense } from 'react';
import VerifyEmailForm from '@/components/auth/verify-email-form';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Career Connect</h1>
          </div>
        </div>

        <Suspense 
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
