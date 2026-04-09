'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bookmark,
  Briefcase,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  MessageCircle,
  User,
  X,
} from 'lucide-react';
import { CandidateNotificationBell } from './CandidateNotificationBell';
import { useChatContext } from '@/contexts/ChatContext';

const navLinks = [
  { label: 'Trang chủ', href: '/candidate' },
  { label: 'Tìm việc làm', href: '/candidate/jobs' },
  { label: 'Công ty', href: '/candidate/companies' },
  { label: 'Hồ sơ CV', href: '/candidate/my-cvs' },
  { label: 'AI Interview', href: '/candidate/interview-sets' },
];

export default function CandidateHeader() {
  const { data: session } = useSession();
  const { conversations, loadConversations } = useChatContext();
  const pathname = usePathname();
  const isHome = pathname === '/candidate';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const solid = !isHome || scrolled;
  const sessionUserId = session?.user?.id;
  const unreadMessagesCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations]
  );
  const unreadMessagesLabel = useMemo(() => {
    if (unreadMessagesCount <= 0) {
      return null;
    }

    return unreadMessagesCount > 9 ? '9+' : String(unreadMessagesCount);
  }, [unreadMessagesCount]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!sessionUserId) {
      return;
    }

    const refreshConversations = () => {
      void loadConversations();
    };

    refreshConversations();

    const intervalId = window.setInterval(refreshConversations, 30000);
    window.addEventListener('focus', refreshConversations);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshConversations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshConversations);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadConversations, sessionUserId]);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        solid
          ? 'border-b border-purple-50/60 bg-white/90 shadow-sm shadow-purple-100/30 backdrop-blur-xl'
          : 'border-b border-white/10 bg-white/5 backdrop-blur-md'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/candidate" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 shadow">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span
              className={`text-lg font-extrabold tracking-tight transition ${
                solid ? 'text-gray-900' : 'text-white'
              }`}
            >
              Career<span className="text-purple-400">Connect</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pathname === link.href
                    ? solid
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-white/20 text-white'
                    : solid
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-purple-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <>
                <Link
                  href="/candidate/chat"
                  className={`relative rounded-full p-2 transition ${
                    solid ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                  }`}
                >
                  <MessageCircle className={`h-5 w-5 ${solid ? 'text-gray-600' : 'text-white'}`} />
                  {unreadMessagesLabel && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
                      {unreadMessagesLabel}
                    </span>
                  )}
                </Link>

                <CandidateNotificationBell
                  solid={solid}
                  shouldClose={dropdownOpen}
                  onOpen={() => setDropdownOpen(false)}
                />

                <div className="relative" onClick={(event) => event.stopPropagation()}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      solid
                        ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        : 'border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                      {(session.user?.name ?? session.user?.email ?? 'U')[0].toUpperCase()}
                    </div>
                    <span className="max-w-[6rem] truncate">
                      {session.user?.name ?? session.user?.email}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/40 bg-white/80 shadow-xl shadow-purple-200/30 backdrop-blur-xl">
                      <div className="border-b border-gray-50 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {session.user?.name ?? session.user?.email}
                        </p>
                        <p className="truncate text-xs text-gray-500">{session.user?.email}</p>
                      </div>

                      {[
                        { label: 'Hồ sơ cá nhân', href: '/candidate/profile', icon: User },
                        { label: 'Quản lý CV', href: '/candidate/my-cvs', icon: FileText },
                        {
                          label: 'Việc làm đã ứng tuyển',
                          href: '/candidate/applications',
                          icon: Briefcase,
                        },
                        {
                          label: 'Việc làm đã lưu',
                          href: '/candidate/saved-jobs',
                          icon: Bookmark,
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Icon className="h-4 w-4 text-purple-400" />
                            {item.label}
                          </Link>
                        );
                      })}

                      <div className="border-t border-gray-50">
                        <button
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    solid ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-purple-700 shadow transition hover:bg-purple-50 hover:shadow-purple-200/60"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            className={`rounded-lg p-2 md:hidden ${solid ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/20 bg-white/80 px-4 pb-4 shadow-lg backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  pathname === link.href
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-4 flex flex-col gap-2">
            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-xl border border-red-100 py-2.5 text-sm font-semibold text-red-600"
              >
                Đăng xuất
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
