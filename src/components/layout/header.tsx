'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              Career Connect
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 rounded w-20 h-8"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Chào, {session.user?.firstName || session.user?.name || session.user?.email}!
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  size="sm"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
