const { Telegraf } = require('telegraf');
const axios = require('axios');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// ⚠️ වැදගත්: YOUR_TELEGRAM_BOT_TOKEN වෙනුවට BotFather ගෙන් ලැබුණු Token එක දාන්න මචං
const bot = new Telegraf('8998263673:AAF3AZmu9WtgNLxRFeoW93yK7yh2qs_wEME);

// 1. සාමාන්‍ය කතාබහ සහ ප්‍රශ්න වලට උත්තර දීම (Gemini AI Chat)
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    
    // මේ විශේෂ වචන ආවොත් text chat එක skip කරලා, පල්ලෙහා තියෙන අදාළ function වලට යන්න ඉඩ දෙනවා
    if (text.includes('පොටෝ') || text.includes('ෆොටෝ') || text.includes('image') || text.includes('draw') || text.startsWith('/qr') || text.startsWith('/bill')) {
        return next();
    }

    await ctx.reply('⏳ Gemini AI සමඟ සම්බන්ධ වෙමින්... මදක් රැඳෙන්න!');
    
    try {
        // නොමිලේ පාවිච්චි කරන්න පුළුවන් පොදු Gemini API එකක් හරහා උත්තර ගැනීම
        const response = await axios.get(`https://open-api.colb.co/gemini?prompt=${encodeURIComponent(text)}`);
        const replyText = response.data.reply || "මචං, මට ඒක හරියටම තේරුණේ නැහැ. ආයෙත් අහන්නකෝ.";
        await ctx.reply(replyText);
    } catch (error) {
        await ctx.reply("💥 සර්වර් එකේ පොඩි අවුලක් මචං. පස්සේ ට්‍රයි කරමුද?");
    }
});

// 2. ෆොටෝ ඇඳීමේ සුපිරි බලය (Pollinations AI Image Generation)
bot.hears([/පොටෝ/, /ෆොටෝ/, /image/, /draw/], async (ctx) => {
    const text = ctx.message.text;
    await ctx.reply('⏳ *Image Generation* AI සමඟ සම්බන්ධ වෙමින්... මදක් රැඳෙන්න!');
    
    // මැසේජ් එකෙන් "පොටෝ" වගේ වචන අයින් කරලා ප්‍රොම්ප්ට් එක විතරක් වෙන් කර ගැනීම
    const prompt = text.replace(/පොටෝ|ෆොටෝ|image|draw/g, '').trim();
    
    if (!prompt) {
        return ctx.reply("මචං, ඔයාට අඳින්න ඕන දේ 'ෆොටෝ එකක් ඕන ලස්සන සිංහයෙක්ගේ' වගේ පැහැදිලිව කියන්නකෝ.");
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
