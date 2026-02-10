
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generatePlaylist } from '../src/ai/flows/generate-playlist';

async function testVideoGeneration() {
    console.log('Testing generatePlaylist flow...');

    if (!process.env.GOOGLE_GENAI_API_KEY) {
        console.error('❌ GOOGLE_GENAI_API_KEY is missing from environment variables.');
        return;
    }

    const prompt = "A playlist for coding late at night with lofi hip hop beats.";

    try {
        console.log(`Sending prompt: "${prompt}"`);
        const result = await generatePlaylist({ prompt });
        console.log('✅ Generation Successful!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('❌ Generation Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.stack) {
            console.error('Stack Trace:', error.stack);
        }
        // Check for specific Google AI error details if available
        if (error.response) {
            console.error('Response Error Details:', JSON.stringify(error.response, null, 2));
        }
    }
}

testVideoGeneration();
