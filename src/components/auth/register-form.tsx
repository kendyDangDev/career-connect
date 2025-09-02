'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { file, z } from 'zod';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Zod validation schema matching the server-side Joi schema
const registerSchema = z
  .object({
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])/,
        'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    firstName: z
      .string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(50, 'Tên không được vượt quá 50 ký tự')
      .regex(
        /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/,
        'Tên chỉ được chứa chữ cái và khoảng trắng'
      ),
    lastName: z
      .string()
      .min(2, 'Họ phải có ít nhất 2 ký tự')
      .max(50, 'Họ không được vượt quá 50 ký tự')
      .regex(
        /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/,
        'Họ chỉ được chứa chữ cái và khoảng trắng'
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+84|84|0)[35789][0-9]{8}$/.test(val),
        'Số điện thoại không hợp lệ (VD: 0901234567)'
      ),
    dateOfBirth: z
      .string()
      .optional()
      .refine(
        (val) => !val || (new Date(val) <= new Date() && new Date(val) >= new Date('1900-01-01')),
        'Ngày sinh không hợp lệ'
      ),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Bạn phải đồng ý với điều khoản sử dụng'),
    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, 'Bạn phải đồng ý với chính sách bảo mật'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Xác nhận mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password),
  };

  Object.values(checks).forEach((check) => check && score++);

  if (score < 3) return { level: 'weak', color: 'bg-red-500', text: 'Yếu' };
  if (score < 4) return { level: 'medium', color: 'bg-yellow-500', text: 'Trung bình' };
  if (score < 5) return { level: 'strong', color: 'bg-green-500', text: 'Mạnh' };
  return { level: 'very-strong', color: 'bg-green-600', text: 'Rất mạnh' };
};

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ level: '', color: '', text: '' });
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const watchPassword = form.watch('password');

  // Update password strength when password changes
  useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(getPasswordStrength(watchPassword));
    } else {
      setPasswordStrength({ level: '', color: '', text: '' });
    }
  }, [watchPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle validation errors
          const fieldErrors: { [key: string]: string } = {};
          result.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message;
          });

          // Set form errors
          Object.entries(fieldErrors).forEach(([field, message]) => {
            form.setError(field as keyof RegisterFormData, { message });
          });
        } else {
          setError(result.error || 'Đã có lỗi xảy ra');
        }
        return;
      }

      setSuccess(result.message);

      // Redirect to email verification page after 2 seconds
      setTimeout(() => {
        router.push('/auth/verify-email?email=' + encodeURIComponent(data.email));
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
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
          Tạo tài khoản để khám phá cơ hội nghề nghiệp tuyệt vời
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}
            <FormField
              name="firstName"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Tên *</FormLabel>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      placeholder="Tên của bạn"
                      className="h-12 border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <FormMessage />
                </>
              )}
            ></FormField>

            <FormField
              name="lastName"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Họ *</FormLabel>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      placeholder="Họ của bạn"
                      className="h-12 border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <FormMessage />
                </>
              )}
            ></FormField>
            {/* </div> */}

            {/* Email */}
            <FormField
              name="email"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Email *</FormLabel>
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
            ></FormField>

            {/* Phone (Optional) */}
            <FormField
              name="phone"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Số điện thoại</FormLabel>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      type="tel"
                      placeholder="0901234567 (tùy chọn)"
                      className="h-12 border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <FormMessage />
                </>
              )}
            ></FormField>

            {/* Date of Birth (Optional) */}
            <FormField
              name="dateOfBirth"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Ngày sinh</FormLabel>
                  <div className="relative">
                    <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      type="date"
                      className="h-12 border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <FormMessage />
                </>
              )}
            ></FormField>

            {/* Password */}
            <FormField
              name="password"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Mật khẩu *</FormLabel>
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

                  {/* Password Strength Indicator */}
                  {watchPassword && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                        <span
                          className={`font-medium ${
                            passwordStrength.level === 'weak'
                              ? 'text-red-600'
                              : passwordStrength.level === 'medium'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{
                            width:
                              passwordStrength.level === 'weak'
                                ? '25%'
                                : passwordStrength.level === 'medium'
                                  ? '50%'
                                  : passwordStrength.level === 'strong'
                                    ? '75%'
                                    : '100%',
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </>
              )}
            ></FormField>

            {/* Confirm Password */}
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <>
                  <FormLabel className="font-medium text-gray-700">Xác nhận mật khẩu *</FormLabel>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="h-12 border-gray-300 pr-11 pl-11 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </>
              )}
            ></FormField>

            {/* Terms and Privacy */}
            <div className="space-y-3">
              <FormField
                name="acceptTerms"
                render={({ field }) => (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        {...field}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label className="text-sm text-gray-700">
                        Tôi đồng ý với{' '}
                        <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                          Điều khoản sử dụng
                        </a>
                      </label>
                    </div>
                    <FormMessage />
                  </>
                )}
              ></FormField>

              <FormField
                name="acceptPrivacy"
                render={({ field }) => (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        {...form.register('acceptPrivacy')}
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label className="text-sm text-gray-700">
                        Tôi đồng ý với{' '}
                        <a
                          href="/privacy"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Chính sách bảo mật
                        </a>
                      </label>
                    </div>
                    <FormMessage />
                  </>
                )}
              ></FormField>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-blue-600 text-base font-medium text-white hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
            Đăng nhập ngay
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
