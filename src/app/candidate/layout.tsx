'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  User, 
  Settings,
  LogOut 
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/candidate/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My CVs',
    href: '/candidate/cv-management',
    icon: FileText,
  },
  {
    label: 'Job Applications',
    href: '/candidate/applications',
    icon: Briefcase,
  },
  {
    label: 'Profile',
    href: '/candidate/profile',
    icon: User,
  },
  {
    label: 'Settings',
    href: '/candidate/settings',
    icon: Settings,
  },
];

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth/signin';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Career Connect - Candidate Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}