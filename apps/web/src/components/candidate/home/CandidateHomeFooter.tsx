import Link from 'next/link';
import { Briefcase, Facebook, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  'Ứng viên': [
    { label: 'Tìm việc làm', href: '/jobs' },
    { label: 'Quản lý CV', href: '/candidate/cv-management' },
    { label: 'Việc làm đã lưu', href: '/candidate/saved-jobs' },
    { label: 'Đơn ứng tuyển', href: '/candidate/applications' },
    { label: 'Việc làm phù hợp', href: '/candidate/matches' },
  ],
  'Nhà tuyển dụng': [
    { label: 'Đăng tuyển dụng', href: '/employer/jobs/create' },
    { label: 'Tìm ứng viên', href: '/employer/candidates' },
    { label: 'Quản lý tuyển dụng', href: '/employer/dashboard' },
  ],
  'Khám phá': [
    { label: 'Công ty hàng đầu', href: '/companies' },
    { label: 'Danh mục việc làm', href: '/jobs' },
    { label: 'Blog nghề nghiệp', href: '/blog' },
    { label: 'Hỗ trợ', href: '/support' },
  ],
};

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function CandidateHomeFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Career<span className="text-purple-400">Connect</span>
              </span>
            </Link>
            <p className="mt-3 mb-6 text-sm leading-relaxed">
              Nền tảng kết nối ứng viên với nhà tuyển dụng hàng đầu Việt Nam. Tìm kiếm cơ hội nghề
              nghiệp tốt nhất cho bạn.
            </p>
            {/* Contact */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <span>support@careerconnect.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-400" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                <span>Tầng 12, 285 Cách Mạng Tháng 8, Q.10, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition hover:text-purple-300">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
          <p className="text-sm">
            © {new Date().getFullYear()} CareerConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-purple-500 hover:bg-purple-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs">
            <Link href="/privacy" className="hover:text-purple-300">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-purple-300">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
