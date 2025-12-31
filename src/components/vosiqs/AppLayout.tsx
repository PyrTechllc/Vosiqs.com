'use client';
import { SidebarProvider, Sidebar, useSidebar } from '@/components/ui/sidebar';
import { VosiqsHeader } from './Header';
import { VosiqsSidebar } from './Sidebar';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

function AppContent({ children }: { children: ReactNode }) {
  const { state, isMobile } = useSidebar();
  
  return (
    <div 
      className={cn(
        "flex flex-col w-full min-h-screen transition-[margin-left] duration-300 ease-in-out",
        !isMobile && state === 'expanded' && "md:ml-64",
        !isMobile && state === 'collapsed' && "md:ml-12",
        isMobile && "ml-12"
      )}
    >
      <VosiqsHeader />
      <main className='flex-1'>
        {children}
      </main>
    </div>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <VosiqsSidebar />
        </Sidebar>
        <AppContent>
          {children}
        </AppContent>
      </div>
    </SidebarProvider>
  );
}
