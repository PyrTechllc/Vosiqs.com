'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Crown, Loader2, Star } from 'lucide-react';
import { useUser, signInWithGoogle } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface PricingModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PricingModal({ isOpen, onOpenChange }: PricingModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        if (!user) {
            toast({ title: "Sign In Required", description: "Please sign in to upgrade." });
            signInWithGoogle();
            return;
        }

        setLoadingPlan(plan);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    userEmail: user.email,
                    plan
                })
            });

            if (!res.ok) throw new Error("Checkout failed");

            const { url } = await res.json();
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "Something went wrong starting checkout." });
            setLoadingPlan(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader className="text-center pb-4">
                    <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                        Upgrade to Vosiqs<span className="text-amber-400">Plus</span>
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Unlock the full potential of AI playlist generation.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 p-1">
                    {/* Monthly Plan */}
                    <Card className="border-border hover:border-primary/50 transition-colors relative">
                        <CardHeader>
                            <CardTitle className="text-xl">Monthly</CardTitle>
                            <CardDescription>Flexible, cancel anytime</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold">$5.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm text-left">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited AI Prompts</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited Re-rolls</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Save up to 100 Playlists</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Priority Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => handleSubscribe('monthly')}
                                disabled={loadingPlan !== null}
                            >
                                {loadingPlan === 'monthly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Subscribe Monthly
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Annual Plan */}
                    <Card className="border-amber-400 shadow-lg shadow-amber-400/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2"><Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" /> Annual</CardTitle>
                            <CardDescription>Save ~16% yearly</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold">$59.99<span className="text-sm font-normal text-muted-foreground">/yr</span></div>
                            <ul className="space-y-2 text-sm text-left">
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> All Pro features</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> Save 2 months free</li>
                                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500" /> Early access to new features</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none"
                                onClick={() => handleSubscribe('yearly')}
                                disabled={loadingPlan !== null}
                            >
                                {loadingPlan === 'yearly' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Subscribe Annually
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
