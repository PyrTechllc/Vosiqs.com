'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VosiqsLogo = ({ className }: { className?: string }) => (
    <div className={cn("flex items-center gap-2", className)}>
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center p-2">
            <div className="grid grid-cols-2 gap-1.5">
                <div className="w-5 h-5 bg-primary-foreground/70 rounded-md"></div>
                <div className="w-5 h-5 bg-primary-foreground/70 rounded-md"></div>
                <div className="w-5 h-5 bg-primary-foreground/70 rounded-md col-span-2 mx-auto"></div>
            </div>
        </div>
        <span className="text-4xl font-bold text-primary tracking-tighter">Vosiqs</span>
    </div>
);

export default function CoverPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground dark:bg-neutral-900">
            <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
                <div className="flex flex-col items-center gap-8">
                    <VosiqsLogo />
                    
                    <div className="flex flex-col gap-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-foreground dark:text-white">
                            Direct the<br />vibes
                        </h1>

                        <p className="max-w-xs sm:max-w-md mx-auto text-muted-foreground dark:text-neutral-400 text-lg">
                            Type a prompt, Vosiqs builds a mosaic playlist of videos that match your mood.
                        </p>
                    </div>

                    <div className="mt-8">
                         <Link href="/app" passHref>
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-12 py-7 text-lg font-bold tracking-wide">
                                TRY IT
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
