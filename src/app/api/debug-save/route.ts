import { NextResponse } from 'next/server';
import { savePlaylist } from '@/lib/firestore-utils';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: Request) {
    try {
        if (!adminDb) {
            return NextResponse.json({
                success: false,
                error: 'Firebase Admin not initialized. Check server logs and env vars.'
            }, { status: 500 });
        }

        // Mock playlist data
        const mockPlaylist = {
            name: "Debug Playlist " + new Date().toISOString(),
            description: "Created via debug endpoint to test Firestore",
            prompt: "debug prompt",
            videos: [
                {
                    id: "test-video-id",
                    title: "Test Video",
                    thumbnailUrl: "https://example.com/thumb.jpg",
                    channelTitle: "Test Channel",
                    description: "Test Description"
                }
            ]
        };

        // Use a test user ID
        const testUserId = "debug-test-user";

        await savePlaylist(testUserId, mockPlaylist);

        return NextResponse.json({
            success: true,
            message: `Successfully saved playlist to users/${testUserId}/playlists`
        });

    } catch (error: any) {
        console.error("Debug Save Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            stack: error.stack
        }, { status: 500 });
    }
}
