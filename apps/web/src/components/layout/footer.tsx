export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">CC</span>
              </div>
              <h3 className="text-xl font-bold">Career Connect</h3>
            </div>
            <p className="mb-4 text-gray-400">
              Nền tảng kết nối nhân tài với cơ hội nghề nghiệp tốt nhất. Giúp bạn tìm kiếm việc làm
              mơ ước và xây dựng sự nghiệp thành công.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Liên kết</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="transition-colors hover:text-white">
                  Trang chủ
                </a>
              </li>
              <li>
                <a href="/candidate/jobs" className="transition-colors hover:text-white">
                  Việc làm
                </a>
              </li>
              <li>
                <a href="/companies" className="transition-colors hover:text-white">
                  Công ty
                </a>
              </li>
              <li>
                <a href="/about" className="transition-colors hover:text-white">
                  Về chúng tôi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/help" className="transition-colors hover:text-white">
                  Trợ giúp
                </a>
              </li>
              <li>
                <a href="/contact" className="transition-colors hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="/privacy" className="transition-colors hover:text-white">
                  Bảo mật
                </a>
              </li>
              <li>
                <a href="/terms" className="transition-colors hover:text-white">
                  Điều khoản
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Career Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
