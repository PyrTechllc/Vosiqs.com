const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key) {
                let value = valueParts.join('=').trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length - 1);
                }
                envVars[key.trim()] = value;
            }
        }
    });
}

const GEMINI_KEY = envVars['GOOGLE_GENAI_API_KEY'];

if (!GEMINI_KEY) {
    console.error('❌ GOOGLE_GENAI_API_KEY not found in .env.local');
    process.exit(1);
}

async function testAIFlow() {
    console.log('Testing AI flow with gemini-2.5-flash...\n');

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        console.log('Step 1: Testing playlist generation...');
        const prompt = 'Create a chill lofi playlist';

        const promptText = `You are an AI playlist curator. Based on the user's prompt, generate:
1. A unique, catchy name for the playlist.
2. A short description.
3. A refined search query for YouTube.

User Prompt: ${prompt}

Return JSON only:
{
  "name": "Playlist Name",
  "description": "Description",
  "refinedQuery": "search query"
}`;

        const result = await model.generateContent(promptText);
        const text = result.response.text();
        console.log('✅ AI Response received');
        console.log('Raw response:', text.substring(0, 200) + '...');

        // Try to parse
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        console.log('\n✅ Parsed successfully:');
        console.log('  Name:', parsed.name);
        console.log('  Description:', parsed.description);
        console.log('  Query:', parsed.refinedQuery);

        console.log('\n✅ All tests passed! The AI flow is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

testAIFlow();
