'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Bookmark,
  Briefcase,
  Building2,
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
import {
  CANDIDATE_PROFILE_CHANGED_EVENT,
  type CandidateProfileChangedDetail,
} from '@/lib/candidate/profile-events';

const EMPLOYER_REQUEST_CHANGED_EVENT = 'candidate-employer-request:changed';

const navLinks = [
  { label: 'Trang chủ', href: '/candidate' },
  { label: 'Tìm việc làm', href: '/candidate/jobs' },
  { label: 'Công ty', href: '/candidate/companies' },
  { label: 'Hồ sơ CV', href: '/candidate/my-cvs' },
  { label: 'AI Interview', href: '/candidate/interview-sets' },
];

type EmployerEntryStatus = 'default' | 'pending' | 'rejected';
type CandidateHeaderIdentity = {
  email: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

function getEmployerEntryStatus(status?: string): EmployerEntryStatus {
  if (status === 'PENDING') {
    return 'pending';
  }

  if (status === 'REJECTED') {
    return 'rejected';
  }

  return 'default';
}

function getEmployerEntryLabel(status: EmployerEntryStatus) {
  switch (status) {
    case 'pending':
      return 'Yêu cầu nhà tuyển dụng đang chờ duyệt';
    case 'rejected':
      return 'Cập nhật yêu cầu nhà tuyển dụng';
    default:
      return 'Trở thành nhà tuyển dụng';
  }
}

function getCandidateDisplayName(identity: CandidateHeaderIdentity) {
  return (
    [identity.firstName, identity.lastName].filter(Boolean).join(' ').trim() ||
    identity.name ||
    identity.email ||
    'Người dùng'
  );
}

export default function CandidateHeader() {
  const { data: session } = useSession();
  const { conversations, loadConversations } = useChatContext();
  const pathname = usePathname();
  const isHome = pathname === '/candidate';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [employerEntryStatus, setEmployerEntryStatus] = useState<EmployerEntryStatus>('default');
  const [profileIdentity, setProfileIdentity] = useState<CandidateHeaderIdentity>({
    email: session?.user?.email ?? null,
    name: session?.user?.name ?? null,
    firstName: session?.user?.firstName ?? null,
    lastName: session?.user?.lastName ?? null,
    avatarUrl: session?.user?.avatarUrl ?? null,
  });

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
  const employerEntryLabel = useMemo(
    () => getEmployerEntryLabel(employerEntryStatus),
    [employerEntryStatus]
  );
  const candidateDisplayName = useMemo(
    () => getCandidateDisplayName(profileIdentity),
    [profileIdentity]
  );
  const candidateAvatarFallback = useMemo(
    () => candidateDisplayName[0]?.toUpperCase() ?? 'U',
    [candidateDisplayName]
  );

  useEffect(() => {
    setProfileIdentity({
      email: session?.user?.email ?? null,
      name: session?.user?.name ?? null,
      firstName: session?.user?.firstName ?? null,
      lastName: session?.user?.lastName ?? null,
      avatarUrl: session?.user?.avatarUrl ?? null,
    });
  }, [
    session?.user?.avatarUrl,
    session?.user?.email,
    session?.user?.firstName,
    session?.user?.lastName,
    session?.user?.name,
  ]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleProfileChanged = (event: Event) => {
      const detail = (event as CustomEvent<CandidateProfileChangedDetail>).detail;

      setProfileIdentity((current) => ({
        ...current,
        ...detail,
      }));
    };

    window.addEventListener(CANDIDATE_PROFILE_CHANGED_EVENT, handleProfileChanged as EventListener);

    return () => {
      window.removeEventListener(
        CANDIDATE_PROFILE_CHANGED_EVENT,
        handleProfileChanged as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) {
      return;
    }

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

  useEffect(() => {
    if (session?.user?.userType !== 'CANDIDATE') {
      setEmployerEntryStatus('default');
      return;
    }

    let cancelled = false;

    const syncEmployerRequestState = () => {
      void (async () => {
        try {
          const response = await fetch('/api/candidate/employer-request', {
            method: 'GET',
            cache: 'no-store',
          });

          const payload = await response.json().catch(() => null);

          if (!response.ok || cancelled) {
            return;
          }

          setEmployerEntryStatus(getEmployerEntryStatus(payload?.data?.status));
        } catch {
          if (!cancelled) {
            setEmployerEntryStatus('default');
          }
        }
      })();
    };

    const handleEmployerRequestChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: string }>).detail;
      if (!cancelled) {
        setEmployerEntryStatus(getEmployerEntryStatus(detail?.status));
      }
    };

    syncEmployerRequestState();
    window.addEventListener('focus', syncEmployerRequestState);
    window.addEventListener(
      EMPLOYER_REQUEST_CHANGED_EVENT,
      handleEmployerRequestChanged as EventListener
    );

    return () => {
      cancelled = true;
      window.removeEventListener('focus', syncEmployerRequestState);
      window.removeEventListener(
        EMPLOYER_REQUEST_CHANGED_EVENT,
        handleEmployerRequestChanged as EventListener
      );
    };
  }, [pathname, session?.user?.userType]);

  const menuItems = [
    { label: 'Hồ sơ cá nhân', href: '/candidate/profile', icon: User },
    { label: 'Quản lý CV', href: '/candidate/my-cvs', icon: FileText },
    {
      label: employerEntryLabel,
      href: '/candidate/become-employer',
      icon: Building2,
    },
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
  ];

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
                  {unreadMessagesLabel ? (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
                      {unreadMessagesLabel}
                    </span>
                  ) : null}
                </Link>

                <CandidateNotificationBell
                  solid={solid}
                  shouldClose={dropdownOpen}
                  onOpen={() => setDropdownOpen(false)}
                />

                <div className="relative" onClick={(event) => event.stopPropagation()}>
                  <button
                    onClick={() => setDropdownOpen((current) => !current)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      solid
                        ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        : 'border-white/30 text-white hover:bg-white/10'
                    }`}
                  >
                    {profileIdentity.avatarUrl ? (
                      <img
                        src={profileIdentity.avatarUrl}
                        alt="User avatar"
                        className="h-6 w-6 rounded-full bg-white object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                        {candidateAvatarFallback}
                      </div>
                    )}
                    <span className="max-w-[11rem] truncate">
                      {candidateDisplayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {dropdownOpen ? (
                    <div className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-1.5 shadow-xl ring-1 shadow-purple-200/40 ring-black/5 backdrop-blur-xl">
                      <div className="mb-1 flex items-center gap-3 border-b border-gray-100/80 px-3 py-3">
                        {profileIdentity.avatarUrl ? (
                          <img
                            src={profileIdentity.avatarUrl}
                            alt="User avatar"
                            className="h-10 w-10 shrink-0 rounded-full border border-gray-100 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple-100 bg-purple-50 text-base font-bold text-purple-600">
                            {candidateAvatarFallback}
                          </div>
                        )}
                        <div className="flex min-w-0 flex-col">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {candidateDisplayName}
                          </p>
                          <p className="truncate text-xs text-gray-500">{profileIdentity.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        {menuItems.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                            >
                              <Icon className="h-4 w-4 text-purple-400" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-1 border-t border-gray-100/80 pt-1">
                        <button
                          onClick={() => signOut()}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  ) : null}
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
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
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

            {session ? (
              <Link
                href="/candidate/become-employer"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  pathname === '/candidate/become-employer'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {employerEntryLabel}
              </Link>
            ) : null}
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
      ) : null}
    </header>
  );
}
