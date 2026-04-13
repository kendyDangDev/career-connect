import { BrandLogo } from '@/components/brand/BrandLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 lg:flex lg:w-1/2 xl:w-2/5">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="animate-blob absolute top-0 -left-4 h-72 w-72 rounded-full bg-white mix-blend-multiply blur-xl filter"></div>
            <div className="animate-blob animation-delay-2000 absolute top-0 -right-4 h-72 w-72 rounded-full bg-white mix-blend-multiply blur-xl filter"></div>
            <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-white mix-blend-multiply blur-xl filter"></div>
          </div>

          <div className="relative flex w-full flex-col items-center justify-center px-12 text-white">
            <div className="space-y-6 text-center">
              <BrandLogo
                size={52}
                priority
                className="mb-8 justify-center gap-3"
                iconClassName="rounded-xl bg-white/95 p-1.5 shadow-lg"
                labelClassName="text-3xl font-bold text-white"
              />

              <h2 className="text-4xl leading-tight font-bold lg:text-5xl">
                Kết nối <span className="text-cyan-200">Cơ hội</span>
                <br />
                Nghề nghiệp
              </h2>

              <p className="max-w-md text-xl leading-relaxed text-blue-100">
                Nền tảng tuyển dụng hàng đầu giúp kết nối nhà tuyển dụng và ứng viên một cách hiệu
                quả nhất.
              </p>

              <div className="mt-12 flex items-center space-x-8 text-blue-100">
                <div className="text-center">
                  <div className="text-2xl font-bold">10K+</div>
                  <div className="text-sm">Công việc</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5K+</div>
                  <div className="text-sm">Công ty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm">Ứng viên</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
