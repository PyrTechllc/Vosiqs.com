'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useUser, signInWithGoogle } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PricingModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PricingModal({ isOpen, onOpenChange }: PricingModalProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'weekly'>('monthly');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            toast({ title: "Sign In Required", description: "Please sign in to upgrade." });
            signInWithGoogle();
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    userEmail: user.email,
                    plan: selectedPlan
                })
            });

            if (!res.ok) throw new Error("Checkout failed");

            const { url } = await res.json();
            window.location.href = url;
        } catch (e) {
            console.error(e);
            toast({ variant: "destructive", title: "Error", description: "Something went wrong starting checkout." });
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card">
                <div className="p-6 pb-0">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-center">
                            Choose your plan
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Monthly Plan */}
                        <div
                            onClick={() => setSelectedPlan('monthly')}
                            className={cn(
                                "relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                selectedPlan === 'monthly'
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="absolute top-0 right-0 transform translate-x-[1px] -translate-y-[100%]">
                                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-t-lg shadow-sm">
                                    Free 7 day trial
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    selectedPlan === 'monthly' ? "border-primary" : "border-muted-foreground"
                                )}>
                                    {selectedPlan === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">Monthly</div>
                                    <div className="text-sm text-muted-foreground">$5.99 / mo</div>
                                </div>
                            </div>
                            <div className="bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-sm">
                                $0.50 per day
                            </div>
                        </div>

                        {/* Weekly Plan */}
                        <div
                            onClick={() => setSelectedPlan('weekly')}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                selectedPlan === 'weekly'
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    selectedPlan === 'weekly' ? "border-primary" : "border-muted-foreground"
                                )}>
                                    {selectedPlan === 'weekly' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">Weekly</div>
                                    <div className="text-sm text-muted-foreground">$3.99 / wk</div>
                                </div>
                            </div>
                            <div className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1.5 rounded-md">
                                $0.71 per day
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            className="w-full text-lg h-12 rounded-xl font-bold"
                            onClick={handleSubscribe}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            {!isLoading && (selectedPlan === 'monthly' ? 'Start Free 7 Day Trial' : 'Get Vosiqs Pro')}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            {selectedPlan === 'monthly' ? '7 days free, then $5.99/mo. Cancel anytime.' : '$3.99 billed weekly. Cancel anytime.'}
                        </p>
                    </div>
                </div>

                <div className="bg-muted/30 p-6 mt-6 border-t">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        Vosiqs Pro includes:
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-primary shrink-0" />
                            <span>Unlimited AI Prompts and rerolls</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-primary shrink-0" />
                            <span>Save up to 100 playlists</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-primary shrink-0" />
                            <span>Download playlists</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm">
                            <Check className="w-5 h-5 text-primary shrink-0" />
                            <span>No ads</span>
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}
