'use client';

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '..';

export * from './use-user';

export async function signInWithGoogle() {
    if (!auth) throw new Error('Auth not initialized');

    const provider = new GoogleAuthProvider();
    // Add scopes for YouTube data access
    provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
    provider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');

    // Force account selection so user can see it's asking for permissions
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    try {
        const result = await signInWithPopup(auth, provider);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;

        if (token) {
            // Store token for the session to use in YouTube API calls
            sessionStorage.setItem('youtube_access_token', token);
            console.log('YouTube Access Token obtained');
        }

        return result.user;
    } catch (error: any) {
        console.error('Error signing in with Google:', error.code, error.message);
        throw error;
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
