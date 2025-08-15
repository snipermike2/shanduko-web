'use client';

import { Navigation } from './Navigation';
import { TabBar } from './TabBar';
import { PWAInstall } from '@/components/PWAInstall';
import { Toast } from '@/components/ui/Toast';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>
      
      {/* Main content */}
      <main className="md:pl-64 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile tab bar */}
      <div className="md:hidden">
        <TabBar />
      </div>
      
      {/* PWA install prompt */}
      <PWAInstall />
      
      {/* Toast notifications */}
      <Toast />
    </div>
  );
}