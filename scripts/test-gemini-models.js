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

const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp'
];

async function testModel(modelName) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello');
        const text = result.response.text();
        console.log(`✅ ${modelName}: Works! Response: ${text.substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    console.log('Testing available Gemini models...\n');

    for (const modelName of modelsToTry) {
        await testModel(modelName);
    }

    console.log('\nDone!');
}

run();
