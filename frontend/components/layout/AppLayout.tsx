'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CursorGlow } from './CursorGlow';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col text-white relative">
      <CursorGlow />
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="mx-auto max-w-7xl space-y-6 pb-12 transition-all duration-300 ease-in-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
