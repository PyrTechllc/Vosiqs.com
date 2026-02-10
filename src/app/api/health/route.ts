import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        // Check Admin DB
        let dbStatus = 'disconnected';
        if (adminDb) {
            try {
                // Try a lightweight read
                await adminDb.listCollections();
                dbStatus = 'connected';
            } catch (e: any) {
                dbStatus = `error: ${e.message}`;
            }
        } else {
            dbStatus = 'not_initialized (check FIREBASE env vars)';
        }

        const envStatus = {
            FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
            FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
            FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY
                ? (process.env.FIREBASE_PRIVATE_KEY.length > 50 ? 'set (length > 50)' : 'set (too short)')
                : 'missing',
            GOOGLE_GENAI_API_KEY: !!process.env.GOOGLE_GENAI_API_KEY,
            YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
            STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
            NODE_ENV: process.env.NODE_ENV,
        };

        return NextResponse.json({
            status: 'online',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            environment: envStatus,
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
