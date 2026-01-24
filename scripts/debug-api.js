const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local manually
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

const YOUTUBE_KEY = envVars['YOUTUBE_API_KEY'];
const GEMINI_KEY = envVars['GOOGLE_GENAI_API_KEY'];

console.log('--- Environment Check ---');
console.log('YOUTUBE_KEY found:', !!YOUTUBE_KEY);
console.log('GEMINI_KEY found:', !!GEMINI_KEY);

if (!YOUTUBE_KEY || !GEMINI_KEY) {
    console.error('❌ Missing keys. Please check .env.local');
    process.exit(1);
}

async function testGemini() {
    console.log('\n--- Testing Gemini API ---');
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Say "Hello World" in JSON format: {"message": "Hello World"}');
        const response = result.response;
        const text = response.text();
        console.log('✅ Gemini Response:', text);
        return true;
    } catch (e) {
        console.error('❌ Gemini Error:', e.message);
        return false;
    }
}

async function testYouTube() {
    console.log('\n--- Testing YouTube API ---');
    return new Promise((resolve) => {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${YOUTUBE_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ YouTube Response: Success');
                    const json = JSON.parse(data);
                    console.log(`Found ${json.items?.length || 0} items`);
                    resolve(true);
                } else {
                    console.error(`❌ YouTube Error (${res.statusCode}):`, data);
                    resolve(false);
                }
            });
        }).on('error', e => {
            console.error('❌ Network Error:', e.message);
            resolve(false);
        });
    });
}

async function run() {
    const geminiOk = await testGemini();
    const youtubeOk = await testYouTube();

    if (geminiOk && youtubeOk) {
        console.log('\n✅ All systems go! The backend logic should work.');
    } else {
        console.log('\n❌ Troubleshooting needed.');
    }
}

run();
