'use client';

import React from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent dark:from-blue-900/10"></div>
      </div>
      
      {/* Header */}
      <AdminHeader user={user} />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            {/* Content Container with subtle glassmorphism */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Toast Notifications with updated styling */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
            color: '#111827',
            border: '1px solid rgba(229,231,235,0.5)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
          className: 'rounded-xl',
        }}
      />
    </div>
  );
}
