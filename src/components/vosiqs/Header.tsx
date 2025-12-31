'use client';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Crown, User, LogOut, Loader2, Menu } from 'lucide-react';
import { useUser, signInWithGoogle, signOut } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';




export function VosiqsHeader() {
  const { user, isLoading } = useUser();
  const { isMobile, toggleSidebar } = useSidebar();

  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to upgrade." });
      signInWithGoogle();
      return;
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, userEmail: user.email })
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong starting checkout." });
    }
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
          <DropdownMenuItem className="gap-2" onClick={handleCheckout}>
            <Crown className="text-amber-400" />
            <span>Vosiqs+</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={handleCheckout}>
          <Crown className="w-4 h-4 text-amber-400" />
          Get Plus
        </Button>
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                  <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className='gap-2'>
                <LogOut />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" onClick={() => signInWithGoogle()}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
