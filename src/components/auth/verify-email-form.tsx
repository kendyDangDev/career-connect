'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const verifySchema = z.object({
  token: z.string().min(1, 'Mã xác thực là bắt buộc'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      token: '',
    },
  });

  // Handle countdown for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-verify if token is in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      form.setValue('token', token);
      handleVerify({ token });
    }
  }, [searchParams, form]);

  const handleVerify = async (data: VerifyFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: data.token }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Mã xác thực không hợp lệ');
        return;
      }

      setSuccess('Email đã được xác thực thành công!');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin?message=verified');
      }, 2000);

    } catch (error) {
      console.error('Verification error:', error);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Không tìm thấy địa chỉ email.');
      return;
    }

    try {
      setIsResending(true);
      setError('');

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Không thể gửi lại email');
        return;
      }

      setSuccess('Email xác thực đã được gửi lại!');
      setResendCooldown(60); // 60 seconds cooldown

    } catch (error) {
      console.error('Resend error:', error);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Xác thực Email
        </CardTitle>
        <CardDescription className="text-gray-600 text-base">
          {email ? (
            <>
              Chúng tôi đã gửi mã xác thực <strong>6 chữ số</strong> đến email:<br />
              <span className="font-medium text-gray-900">{email}</span><br />
              <span className="text-sm text-gray-500">Vui lòng kiểm tra hộp thư đến và cả thư mục spam nếu cần</span>
            </>
          ) : (
            'Vui lòng nhập mã xác thực <strong>6 chữ số</strong> được gửi đến email của bạn'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-6">
          <div>
            <label className="text-gray-700 font-medium block mb-2">
              Mã xác thực
            </label>
            <Input
              {...form.register('token')}
              placeholder="Nhập mã 6 chữ số từ email"
              className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-2xl tracking-[0.3em] font-mono"
              disabled={isLoading}
              maxLength={6}
              pattern="[0-9]{6}"
              inputMode="numeric"
            />
            {form.formState.errors.token && (
              <p className="text-red-600 text-sm mt-1">
                {form.formState.errors.token.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xác thực...
              </>
            ) : (
              'Xác thực Email'
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            Không nhận được email?
          </div>
          
          {email && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full h-10"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang gửi...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Gửi lại sau {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gửi lại mã xác thực
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <a 
            href="/auth/signin" 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Quay lại đăng nhập
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
