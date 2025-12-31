'use client';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar
} from '@/components/ui/sidebar';
import { Plus, Home, Library, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';


const VosiqsLogo = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-8 h-8 bg-primary rounded-lg flex items-center justify-center p-1",
          "group-data-[mobile=true]:group-data-[state=collapsed]:w-8 group-data-[mobile=true]:group-data-[state=collapsed]:h-8",
          "group-data-[mobile-sheet=true]:group-data-[state=expanded]:w-8 group-data-[mobile-sheet=true]:group-data-[state=expanded]:h-8",
        )}>
            <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2.5 h-2.5 bg-primary-foreground/70 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-primary-foreground/70 rounded-sm"></div>
                <div className="w-2.5 h-2.5 bg-primary-foreground/70 rounded-sm col-span-2 mx-auto"></div>
            </div>
        </div>
    </div>
);


export function VosiqsSidebar() {
  const pathname = usePathname();
  const { state, isMobile, toggleSidebar } = useSidebar();

  const commonMenuButtonProps = {
    className: cn(
      'group-data-[mobile=true]:justify-center group-data-[mobile=true]:p-2',
      'group-data-[mobile-sheet=true]:group-data-[state=expanded]:flex'
    ),
    children: (
      <>
        <Home />
        <span className={cn('group-data-[mobile=true]:hidden', 'group-data-[mobile-sheet=true]:group-data-[state=expanded]:block')}>Home</span>
      </>
    ),
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <VosiqsLogo />
            <span className={cn("font-headline", "group-data-[state=collapsed]:hidden",
             "group-data-[mobile=true]:hidden",
             "group-data-[mobile-sheet=true]:group-data-[state=expanded]:block"
            )}>Vosiqs</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "group-data-[state=collapsed]:hidden h-7 w-7",
              "group-data-[mobile=true]:hidden",
              "group-data-[mobile-sheet=true]:group-data-[state=expanded]:block"
            )}
            onClick={toggleSidebar}
            >
             <Menu />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home" isActive={pathname === '/app'} className={cn(commonMenuButtonProps.className)}>
                <Link href="/app">
                  <Home />
                  <span className={cn('group-data-[state=collapsed]:hidden', {'hidden': isMobile && state === 'collapsed' }, 'group-data-[mobile=true]:hidden')}>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Library" isActive={pathname === '/app/library'} className={cn(commonMenuButtonProps.className)}>
                <Link href="/app/library">
                  <Library />
                  <span className={cn('group-data-[state=collapsed]:hidden', {'hidden': isMobile && state === 'collapsed' }, 'group-data-[mobile=true]:hidden')}>My Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="New Playlist" className={cn(commonMenuButtonProps.className)}>
                <Plus />
                <span className={cn('group-data-[state=collapsed]:hidden', {'hidden': isMobile && state === 'collapsed' }, 'group-data-[mobile=true]:hidden')}>New Playlist</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>My Playlists</SidebarGroupLabel>
          <SidebarMenu>
            {/* Playlists will be populated here */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
