import { NextResponse } from 'next/server';
import { generatePlaylistAction } from '@/app/actions';
import { checkAndIncrementUsage } from '@/lib/firestore-utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'playlist';
        const prompt = searchParams.get('prompt') || 'relaxing jazz music';

        if (type === 'usage') {
            // Mock userId for testing
            const result = await checkAndIncrementUsage('test-user-id', 'prompt');
            return NextResponse.json({ success: true, result });
        }

        // Default: test playlist generation
        const result = await generatePlaylistAction(prompt, undefined);
        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        console.error("Debug Endpoint Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
