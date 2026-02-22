'use client';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Crown, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';

import { useState } from 'react';
import { PricingModal } from './PricingModal';

export function VosiqsHeader() {
  const { user, isLoaded } = useUser();
  const { isMobile, toggleSidebar } = useSidebar();
  const [showPricing, setShowPricing] = useState(false);
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to upgrade." });
      return;
    }
    setShowPricing(true);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className='h-10 w-10'>
          <Menu />
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <span className="text-lg font-bold tracking-tighter">Vosiqs</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Models</DropdownMenuLabel>
          <DropdownMenuItem>Vosiqs 1.0 (Default)</DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={handleUpgradeClick}>
            <Crown className="text-amber-400" />
            <span>Vosiqs+</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={handleUpgradeClick}>
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Get Plus</span>
        </Button>

        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign In</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
        </SignedIn>
      </div>
      <PricingModal isOpen={showPricing} onOpenChange={setShowPricing} />
    </header>
  );
}
