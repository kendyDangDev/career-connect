import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative flex flex-col justify-center items-center px-12 text-white w-full">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">CC</span>
                </div>
                <h1 className="text-3xl font-bold">Career Connect</h1>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                Kết nối <span className="text-cyan-200">Cơ hội</span>
                <br />
                Nghề nghiệp
              </h2>
              
              <p className="text-xl text-blue-100 leading-relaxed max-w-md">
                Nền tảng tuyển dụng hàng đầu giúp kết nối nhà tuyển dụng 
                và ứng viên một cách hiệu quả nhất.
              </p>
              
              <div className="flex items-center space-x-8 mt-12 text-blue-100">
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
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
