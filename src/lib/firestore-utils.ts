'use server';

import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc, getDocs, query, orderBy, deleteDoc, where } from 'firebase/firestore';
import { firestore } from '@/firebase';
import type { Playlist } from './types';

export async function checkAndIncrementUsage(userId: string, type: 'prompt' | 'reroll') {
    if (!firestore) throw new Error('Firestore not initialized');
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            usage: {
                prompts: 1,
                rerolls: 0,
                lastReset: serverTimestamp()
            },
            isPro: false
        });
        return true;
    }

    const data = userSnap.data();
    const isPro = data.isPro || false;

    if (isPro) return true;

    const limit = type === 'prompt' ? 10 : 3;
    const current = data.usage?.[type + 's'] || 0;

    if (current >= limit) {
        throw new Error(`You have reached your ${type} limit for now.`);
    }

    await updateDoc(userRef, {
        [`usage.${type}s`]: increment(1)
    });

    return true;
}

export async function savePlaylist(userId: string, playlist: Playlist) {
    if (!firestore) throw new Error('Firestore not initialized');

    // Check limit (20 max)
    const playlistsRef = collection(firestore, 'users', userId, 'playlists');
    const snapshot = await getDocs(playlistsRef);

    if (snapshot.size >= 20) {
        // Check if pro? We can duplicate the check or just hard limit for now
        // For MVP, hard limit 20.
        throw new Error("You have reached the maximum of 20 saved playlists.");
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
