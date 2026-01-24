const fs = require('fs');
const path = require('path');
const https = require('https');

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

const API_KEY = envVars['YOUTUBE_API_KEY'];

if (!API_KEY) {
    console.error('❌ YOUTUBE_API_KEY not found in .env.local');
    process.exit(1);
}

console.log(`Testing YouTube API with Key: ${API_KEY.substring(0, 5)}...`);

const query = 'test';
const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=1&key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ YouTube API Connection Successful!');
            const json = JSON.parse(data);
            console.log(`Found ${json.items.length} items.`);
            console.log('First item title:', json.items[0]?.snippet?.title);
        } else {
            console.error(`❌ YouTube API Error: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });

}).on('error', (err) => {
    console.error('Network Error:', err.message);
});
