import { NextResponse } from 'next/server';

// Environment variables for Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request) {
    try {
        const { lat, lng, description, image_url, video_link, reporter_info, emergencyContacts = [] } = await request.json();

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error("Telegram credentials missing on server");
            return NextResponse.json({ success: false, error: "Server misconfiguration: Telegram credentials missing" }, { status: 500 });
        }

        const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        let caption = `🚨 *NCP ALERT!* 🚨\n\nIncident reported.\nView on Maps: ${mapLink}\n\nDescription: ${description}\nReporter: ${reporter_info || 'Anonymous'}`;

        if (video_link) {
            caption += `\n\nVideo/Post Link: ${video_link}`;
        }

        // Prepare recipients (Main Channel + Emergency Contacts)
        // Filter out invalid IDs (must be numbers or valid channel usernames)
        const validContacts = emergencyContacts.filter(c => c && (c.toString().startsWith('@') || !isNaN(c)));
        const allRecipients = [TELEGRAM_CHAT_ID, ...validContacts];
        const uniqueRecipients = [...new Set(allRecipients)];

        const results = await Promise.all(uniqueRecipients.map(async (chatId) => {
            let telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
            let payload;

            if (image_url) {
                // Check for Video
                const isVideo = image_url.match(/\.(mp4|mov|webm|webm|avi|mkv)$/i);
                if (isVideo) {
                    telegramUrl += '/sendVideo';
                    payload = {
                        chat_id: chatId,
                        video: image_url,
                        caption: caption,
                        parse_mode: 'Markdown'
                    };
                } else {
                    telegramUrl += '/sendPhoto';
                    payload = {
                        chat_id: chatId,
                        photo: image_url,
                        caption: caption,
                        parse_mode: 'Markdown'
                    };
                }
            } else {
                // Send Message
                telegramUrl += '/sendMessage';
                payload = {
                    chat_id: chatId,
                    text: caption,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                };
            }

            try {
                const res = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) {
                    console.error(`Failed to send to ${chatId}:`, data);
                    return { chatId, status: 'failed', error: data };
                }
                return { chatId, status: 'sent' };
            } catch (err) {
                console.error(`Network error for ${chatId}:`, err);
                return { chatId, status: 'error', error: err.message };
            }
        }));

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
