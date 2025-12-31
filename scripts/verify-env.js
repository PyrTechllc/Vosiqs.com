#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * 
 * This script checks if all required environment variables are set
 * and provides helpful feedback on what's missing.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

// Load .env.local file
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.log(`\n${colors.red}❌ .env.local file not found!${colors.reset}\n`);
    console.log('Please create a .env.local file in the root directory.');
    console.log('You can use env.example as a template.\n');
    process.exit(1);
}

// Parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=').trim();
            // Strip surrounding quotes if they exist
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length - 1);
            }
            envVars[key.trim()] = value;
        }
    }
});

// Define required environment variables
const requiredVars = {
    'Firebase Client SDK': [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID',
    ],
    'Firebase Admin SDK': [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
    ],
    'Stripe': [
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
    ],
    'YouTube API': [
        'YOUTUBE_API_KEY',
    ],
    'Google AI (Gemini)': [
        'GOOGLE_GENAI_API_KEY',
    ],
};

const optionalVars = {
    'Optional': [
        'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
        'NEXT_PUBLIC_APP_URL',
        'NODE_ENV',
    ],
};

// Check each category
console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  🔍 Vosiqs Environment Variables Check${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

let allGood = true;
let totalRequired = 0;
let totalSet = 0;

Object.entries(requiredVars).forEach(([category, vars]) => {
    console.log(`${colors.blue}📦 ${category}${colors.reset}`);

    vars.forEach(varName => {
        totalRequired++;
        const value = envVars[varName];
        const isSet = value && value !== 'your_api_key_here' && value !== 'your-project-id' && !value.includes('xxxxxxxx');

        if (isSet) {
            totalSet++;
            // Show partial value for verification (first 10 chars)
            const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
            console.log(`  ${colors.green}✓${colors.reset} ${varName}: ${displayValue}`);
        } else {
            allGood = false;
            console.log(`  ${colors.red}✗${colors.reset} ${varName}: ${colors.red}NOT SET${colors.reset}`);
        }
    });

    console.log('');
});

// Check optional variables
console.log(`${colors.blue}📦 Optional Variables${colors.reset}`);
optionalVars['Optional'].forEach(varName => {
    const value = envVars[varName];
    const isSet = value && value !== 'your_api_key_here';

    if (isSet) {
        const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
        console.log(`  ${colors.green}✓${colors.reset} ${varName}: ${displayValue}`);
    } else {
        console.log(`  ${colors.yellow}○${colors.reset} ${varName}: ${colors.yellow}not set (optional)${colors.reset}`);
    }
});

console.log('');
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);

// Summary
const percentage = Math.round((totalSet / totalRequired) * 100);
console.log(`${colors.blue}📊 Summary:${colors.reset}`);
console.log(`  Required variables set: ${totalSet}/${totalRequired} (${percentage}%)`);

if (allGood) {
    console.log(`\n${colors.green}✅ All required environment variables are set!${colors.reset}`);
    console.log(`${colors.green}🚀 You're ready to run the application!${colors.reset}\n`);
    console.log('Run: npm run dev\n');
} else {
    console.log(`\n${colors.yellow}⚠️  Some required environment variables are missing.${colors.reset}`);
    console.log(`${colors.yellow}📖 Please check SETUP_GUIDE.md for instructions.${colors.reset}\n`);
    process.exit(1);
}

// Additional checks
console.log(`${colors.blue}🔍 Additional Checks:${colors.reset}\n`);

// Check if Firebase private key looks valid
if (envVars['FIREBASE_PRIVATE_KEY']) {
    const privateKey = envVars['FIREBASE_PRIVATE_KEY'];
    if (privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')) {
        console.log(`  ${colors.green}✓${colors.reset} Firebase private key format looks correct`);
    } else {
        console.log(`  ${colors.yellow}⚠${colors.reset} Firebase private key might be malformed`);
    }
}

// Check if project IDs match
if (envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] && envVars['FIREBASE_PROJECT_ID']) {
    if (envVars['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] === envVars['FIREBASE_PROJECT_ID']) {
        console.log(`  ${colors.green}✓${colors.reset} Firebase project IDs match`);
    } else {
        console.log(`  ${colors.red}✗${colors.reset} Firebase project IDs don't match!`);
    }
}

// Check Stripe key format
if (envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY']) {
    const pubKey = envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'];
    if (pubKey.startsWith('pk_')) {
        console.log(`  ${colors.green}✓${colors.reset} Stripe publishable key format looks correct`);
    } else {
        console.log(`  ${colors.yellow}⚠${colors.reset} Stripe publishable key should start with 'pk_'`);
    }
}

if (envVars['STRIPE_SECRET_KEY']) {
    const secretKey = envVars['STRIPE_SECRET_KEY'];
    if (secretKey.startsWith('sk_')) {
        console.log(`  ${colors.green}✓${colors.reset} Stripe secret key format looks correct`);
    } else {
        console.log(`  ${colors.yellow}⚠${colors.reset} Stripe secret key should start with 'sk_'`);
    }
}

console.log('');
