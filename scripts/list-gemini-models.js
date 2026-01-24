const https = require('https');
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

console.log('Fetching list of available Gemini models...\n');

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const json = JSON.parse(data);
            console.log('✅ Available models:\n');
            json.models.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                if (supportsGenerate) {
                    console.log(`  ✓ ${model.name.replace('models/', '')} - ${model.displayName}`);
                }
            });
        } else {
            console.error(`❌ Error (${res.statusCode}):`, data);
        }
    });
}).on('error', e => {
    console.error('❌ Network Error:', e.message);
});
