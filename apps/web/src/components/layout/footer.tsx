export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <h3 className="text-xl font-bold">Career Connect</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng kết nối nhân tài với cơ hội nghề nghiệp tốt nhất. 
              Giúp bạn tìm kiếm việc làm mơ ước và xây dựng sự nghiệp thành công.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Trang chủ</a></li>
              <li><a href="/jobs" className="hover:text-white transition-colors">Việc làm</a></li>
              <li><a href="/companies" className="hover:text-white transition-colors">Công ty</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">Về chúng tôi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/help" className="hover:text-white transition-colors">Trợ giúp</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Bảo mật</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Điều khoản</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Career Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
