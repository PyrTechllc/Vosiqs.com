import admin from "firebase-admin";

let app: admin.app.App | undefined;

// Check if all required Firebase Admin credentials are available
const hasCredentials =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && hasCredentials) {
    try {
        app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID!,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
                privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            }),
        });
    } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
    }
} else if (admin.apps.length) {
    app = admin.app();
} else {
    console.warn("Firebase Admin credentials not found. Admin features will be disabled.");
}

// Export safe accessors that won't throw during build
export const adminDb = app ? admin.firestore() : null as any;
export const adminAuth = app ? admin.auth() : null as any;