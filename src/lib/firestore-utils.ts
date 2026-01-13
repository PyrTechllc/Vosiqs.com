'use server';

import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc, getDocs, query, orderBy, deleteDoc, where } from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Playlist } from './types';

export async function checkAndIncrementUsage(userId: string, type: 'prompt' | 'reroll') {
    if (!firestore) throw new Error('Firestore not initialized');
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    const now = new Date();
    const SEVEN_HOURS = 7 * 60 * 60 * 1000;

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            usage: {
                prompts: type === 'prompt' ? 1 : 0,
                rerolls: type === 'reroll' ? 1 : 0,
                lastReset: serverTimestamp()
            },
            isPro: false
        });
        return true;
    }

    const data = userSnap.data();
    // const isPro = data.isPro || false;
    const isPro = true; // Temporary override: Make everyone PRO 

    if (isPro) return true;

    const usage = data.usage || { prompts: 0, rerolls: 0, lastReset: null };
    // Convert Firestore timestamp to JS Date
    const lastReset = usage.lastReset?.toDate?.() || new Date(0);
    const timeSinceReset = now.getTime() - lastReset.getTime();

    if (timeSinceReset >= SEVEN_HOURS) {
        // Reset the window
        await updateDoc(userRef, {
            'usage.prompts': type === 'prompt' ? 1 : 0,
            'usage.rerolls': type === 'reroll' ? 1 : 0,
            'usage.lastReset': serverTimestamp()
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

        await updateDoc(userRef, {
            'usage.prompts': increment(1)
        });
    } else {
        // Rerolls are usually tracked per-prompt in the UI, 
        // but we can increment a global counter here too if needed.
        await updateDoc(userRef, {
            'usage.rerolls': increment(1)
        });
    }

    return true;
}

export async function savePlaylist(userId: string, playlist: Playlist) {
    if (!firestore) throw new Error('Firestore not initialized');

    // Get user status
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    // const isPro = userSnap.exists() ? userSnap.data().isPro : false;
    const isPro = true; // Temporary override

    // Check limit (10 for free, 100 for pro)
    const playlistsRef = collection(firestore, 'users', userId, 'playlists');
    const snapshot = await getDocs(playlistsRef);

    const limit = isPro ? 100 : 10;

    if (snapshot.size >= limit) {
        throw new Error(`You have reached the maximum of ${limit} saved playlists. ${!isPro ? 'Upgrade to Vosiqs+ for more!' : ''}`);
    }

    await addDoc(playlistsRef, {
        ...playlist,
        createdAt: serverTimestamp()
    });
}

export async function getPlaylists(userId: string) {
    if (!firestore) throw new Error('Firestore not initialized');
    const playlistsRef = collection(firestore, 'users', userId, 'playlists');
    // Basic query
    const q = query(playlistsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Playlist & { id: string })[];
}

export async function deletePlaylist(userId: string, playlistId: string) {
    if (!firestore) throw new Error('Firestore not initialized');
    const docRef = doc(firestore, 'users', userId, 'playlists', playlistId);
    await deleteDoc(docRef);
}
