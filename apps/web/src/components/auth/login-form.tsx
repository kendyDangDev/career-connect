'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        console.log('Login error:', result.error);
        // Xử lý các loại lỗi khác nhau
        if (result.error === 'CredentialsSignin') {
          setError('Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.');
        } else {
          setError(result.error);
        }
        return;
      }

      if (result?.ok) {
        // Get the session to determine redirect URL
        const session = await getSession();

        if (session?.user) {
          // Redirect based on user type

          console.log(session.user);
          const redirectUrl =
            session.user.userType === 'EMPLOYER'
              ? '/employer/dashboard'
              : session.user.userType === 'ADMIN'
                ? '/admin'
                : '/candidate';
          router.push(redirectUrl);
          router.refresh();
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      await signIn('google', {
        callbackUrl: '/candidate',
      });
    } catch (error) {
      console.error('Google login error:', error);
      setError('Đăng nhập Google thất bại');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-2xl">
      <CardHeader className="space-y-1 pb-8 text-center">
        <div className="mb-4 flex items-center justify-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-bold text-white">CC</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Career Connect</CardTitle>
        </div>
        <CardDescription className="text-base text-gray-600">
          Đăng nhập để tiếp tục hành trình nghề nghiệp của bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="email"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="yourname@example.com"
                      className="h-12 border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <FormMessage />
                </>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Mật khẩu</FormLabel>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-12 border-gray-300 pr-11 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <FormMessage />
                </>
              )}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <a
                href="/auth/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-blue-600 text-base font-medium text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">Hoặc tiếp tục với</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="h-12 w-full border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <a href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng ký ngay
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
