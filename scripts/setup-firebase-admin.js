#!/usr/bin/env node

/**
 * Firebase Admin Setup Helper
 * 
 * This script helps you extract the necessary credentials from your
 * Firebase service account JSON file and formats them for .env.local
 * 
 * Usage:
 *   node scripts/setup-firebase-admin.js path/to/your-service-account.json
 */

const fs = require('fs');
const path = require('path');

// Get the service account file path from command line arguments
const serviceAccountPath = process.argv[2];

if (!serviceAccountPath) {
    console.error('\n❌ Error: Please provide the path to your service account JSON file\n');
    console.log('Usage:');
    console.log('  node scripts/setup-firebase-admin.js path/to/your-service-account.json\n');
    console.log('Example:');
    console.log('  node scripts/setup-firebase-admin.js ~/Downloads/vosiqs-firebase-adminsdk.json\n');
    process.exit(1);
}

// Check if file exists
if (!fs.existsSync(serviceAccountPath)) {
    console.error(`\n❌ Error: File not found: ${serviceAccountPath}\n`);
    process.exit(1);
}

try {
    // Read and parse the service account JSON
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Extract the required fields
    const projectId = serviceAccount.project_id;
    const clientEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;

    if (!projectId || !clientEmail || !privateKey) {
        console.error('\n❌ Error: Invalid service account file. Missing required fields.\n');
        process.exit(1);
    }

    console.log('\n✅ Successfully read service account file!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 Add these lines to your .env.local file:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('# Firebase Admin SDK Credentials');
    console.log(`FIREBASE_PROJECT_ID="${projectId}"`);
    console.log(`FIREBASE_CLIENT_EMAIL="${clientEmail}"`);
    console.log(`FIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    console.log('💡 Tips:');
    console.log('  1. Copy the lines above');
    console.log('  2. Open your .env.local file');
    console.log('  3. Paste these lines at the end');
    console.log('  4. Save the file');
    console.log('  5. Restart your development server\n');
    console.log('⚠️  IMPORTANT: Never commit .env.local to version control!\n');

    // Optionally, offer to append to .env.local automatically
    const envPath = path.join(process.cwd(), '.env.local');
    console.log('Would you like to automatically append these to .env.local? (y/n)');

    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
            const envContent = `\n# Firebase Admin SDK Credentials (Added ${new Date().toISOString()})\nFIREBASE_PROJECT_ID="${projectId}"\nFIREBASE_CLIENT_EMAIL="${clientEmail}"\nFIREBASE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"\n`;

            fs.appendFileSync(envPath, envContent);
            console.log('\n✅ Successfully added credentials to .env.local!\n');
            console.log('🚀 You can now restart your development server.\n');
        } else {
            console.log('\n👍 No problem! Copy the credentials manually when ready.\n');
        }
        process.exit(0);
    });

} catch (error) {
    console.error('\n❌ Error reading service account file:', error.message, '\n');
    process.exit(1);
}
