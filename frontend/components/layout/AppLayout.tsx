'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#132228] text-[#F5EED2]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
