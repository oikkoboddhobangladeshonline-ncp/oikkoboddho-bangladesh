const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local manually (since we aren't using Next.js here)
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const envVars = {};
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
                    envVars[key] = value;
                }
            });
            return envVars;
        }
    } catch (e) {
        console.error("Error loading .env.local:", e);
    }
    return {};
}

const env = loadEnv();
const TOKEN = env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN not found in .env.local");
    console.log("Please ensure you have set up the token in your environment file.");
    process.exit(1);
}

console.log("🤖 NCP Telegram Assistant is running...");
console.log(`Token detected: ${TOKEN.substring(0, 5)}...`);
console.log("Waiting for messages... (Press Ctrl+C to stop)");

// 2. Poll for Updates
let offset = 0;

async function poll() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&timeout=30`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                // Update offset to acknowledge this update
                offset = update.update_id + 1;

                if (update.message && update.message.text) {
                    const chatId = update.message.chat.id;
                    const user = update.message.from.first_name;
                    const text = update.message.text;

                    console.log(`📩 Message from ${user} (${chatId}): ${text}`);

                    // 3. Reply with Chat ID
                    await sendReply(chatId, `Hello ${user}! 👋\n\nYour Telegram Chat ID is:\n\`${chatId}\`\n\nCopy this and add it to the NCP App Settings.`);
                }
            }
        }
    } catch (error) {
        console.error("Poll Error:", error.message);
        // Wait a bit before retrying on error
        await new Promise(r => setTimeout(r, 5000));
    }

    // Loop
    setImmediate(poll);
}

async function sendReply(chatId, text) {
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
        console.log(`✅ Replied to ${chatId}`);
    } catch (error) {
        console.error("Reply Error:", error.message);
    }
}

// Start Polling
poll();
