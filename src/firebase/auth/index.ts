'use client';

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '..';

export * from './use-user';

export async function signInWithGoogle() {
    if (!auth) throw new Error('Auth not initialized');
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Error signing in with Google', error);
    }
}

export async function signOut() {
    if (!auth) throw new Error('Auth not initialized');
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out', error);
    }
}
