'use server';

import { adminDb } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import type { Playlist } from './types';

export async function checkAndIncrementUsage(userId: string, type: 'prompt' | 'reroll') {
    if (!adminDb) {
        console.warn('Firebase Admin not initialized, skipping usage check');
        return true;
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();

    const now = new Date();
    const SEVEN_HOURS = 7 * 60 * 60 * 1000;

    if (!userSnap.exists) {
        await userRef.set({
            usage: {
                prompts: type === 'prompt' ? 1 : 0,
                rerolls: type === 'reroll' ? 1 : 0,
                lastReset: admin.firestore.FieldValue.serverTimestamp()
            },
            isPro: false
        });
        return true;
    }

    const data = userSnap.data() as any;
    const isPro = data.isPro || false;

    if (isPro) return true;

    const usage = data.usage || { prompts: 0, rerolls: 0, lastReset: null };
    // Convert Firestore timestamp to JS Date
    const lastReset = usage.lastReset?.toDate?.() || new Date(0);
    const timeSinceReset = now.getTime() - lastReset.getTime();

    if (timeSinceReset >= SEVEN_HOURS) {
        // Reset the window
        await userRef.update({
            'usage.prompts': type === 'prompt' ? 1 : 0,
            'usage.rerolls': type === 'reroll' ? 1 : 0,
            'usage.lastReset': admin.firestore.FieldValue.serverTimestamp()
        });
        return true;
    }

    if (type === 'prompt') {
        if (usage.prompts >= 10) {
            const nextAvailable = new Date(lastReset.getTime() + SEVEN_HOURS);
            const waitMs = nextAvailable.getTime() - now.getTime();
            const waitHours = Math.floor(waitMs / (1000 * 60 * 60));
            const waitMins = Math.ceil((waitMs % (1000 * 60 * 60)) / (1000 * 60));

            throw new Error(`You've used your 10 free prompts. Please wait ${waitHours}h ${waitMins}m or upgrade to Vosiqs+ for unlimited prompts!`);
        }

        await userRef.update({
            'usage.prompts': admin.firestore.FieldValue.increment(1)
        });
    } else {
        await userRef.update({
            'usage.rerolls': admin.firestore.FieldValue.increment(1)
        });
    }

    return true;
    } catch (error: any) {
        // Handle Firestore database not found error (code 5)
        if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
            console.error('Firestore database not found. Please create a Firestore database in the Firebase Console.');
            console.warn('Skipping usage check - user can proceed without rate limiting');
            return true;
        }
        // Re-throw other errors
        throw error;
    }
}

export async function savePlaylist(userId: string, playlist: Playlist) {
    if (!adminDb) throw new Error('Firebase Admin not initialized');

    try {
        // Get user status
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();
        const isPro = userSnap.exists ? (userSnap.data() as any).isPro : false;

        // Check limit (10 for free, 100 for pro)
        const playlistsRef = adminDb.collection('users').doc(userId).collection('playlists');
        const snapshot = await playlistsRef.get();

        const limit = isPro ? 100 : 10;

        if (snapshot.size >= limit) {
            throw new Error(`You have reached the maximum of ${limit} saved playlists. ${!isPro ? 'Upgrade to Vosiqs+ for more!' : ''}`);
        }

        await playlistsRef.add({
            ...playlist,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error: any) {
        // Handle Firestore database not found error
        if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
            throw new Error('Firestore database not configured. Please create a Firestore database in the Firebase Console to save playlists.');
        }
        // Re-throw other errors
        throw error;
    }
}

export async function getPlaylists(userId: string) {
    if (!adminDb) throw new Error('Firebase Admin not initialized');

    try {
        const playlistsRef = adminDb.collection('users').doc(userId).collection('playlists');
        const snapshot = await playlistsRef.orderBy('createdAt', 'desc').get();

        return snapshot.docs.map((doc: any) => {
            const data = doc.data();

            // Convert Firestore Timestamp to ISO string for client components
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                data.createdAt = data.createdAt.toDate().toISOString();
            }

            return { id: doc.id, ...data };
        }) as (Playlist & { id: string, createdAt: string })[];
    } catch (error: any) {
        // Handle Firestore database not found error
        if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
            console.error('Firestore database not found');
            return [];
        }
        throw error;
    }
}

export async function deletePlaylist(userId: string, playlistId: string) {
    if (!adminDb) throw new Error('Firebase Admin not initialized');

    try {
        const docRef = adminDb.collection('users').doc(userId).collection('playlists').doc(playlistId);
        await docRef.delete();
    } catch (error: any) {
        // Handle Firestore database not found error
        if (error.code === 5 || error.message?.includes('NOT_FOUND')) {
            throw new Error('Firestore database not configured.');
        }
        throw error;
    }
}
