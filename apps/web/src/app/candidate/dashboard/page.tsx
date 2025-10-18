import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-config';

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chào mừng, {session.user?.firstName || session.user?.name}!
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900">
                Dashboard Ứng viên
              </h2>
              <p className="text-blue-700">
                Bạn đã đăng nhập thành công vào hệ thống Career Connect.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">Thông tin tài khoản</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Loại tài khoản:</strong> {session.user?.userType}</p>
                  <p><strong>Trạng thái:</strong> Đã xác thực</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">Thao tác nhanh</h3>
                <div className="mt-2 space-y-2">
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Cập nhật hồ sơ
                  </button>
                  <br />
                  <button className="text-sm text-blue-600 hover:text-blue-500">
                    Tìm việc làm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
