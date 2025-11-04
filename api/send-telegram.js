// /api/send-telegram.js
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Basic env validation
  const BOT = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!BOT || !CHAT) {
    return res.status(500).json({ error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars' });
  }

  try {
    const body = req.body || {};

    // If the front sends a ready-made text — use it.
    // Otherwise, build a clean message from fields.
    const {
      text,
      name = '',
      age = '',
      location = '',
      experience = '',
      about = '',
      source = '',
      source_other = '',
      time = ''
    } = body;

    const finalText = text && String(text).trim().length
      ? text
      : [
          'היי 💜',
          'כדי שאוכל להתאים לך את החוויה הכי טובה באימון, תוכל/י למלא כמה פרטים קצרים?',
          '',
          '👇',
          `👤 שם: ${name || '—'}`,
          `🎂 גיל: ${age || '—'}`,
          `📍 מאיפה את/ה: ${location || '—'}`,
          '',
          '🏋️‍♀️ ניסיון קודם באימונים:',
          `${experience || '—'}`,
          '',
          '💬 כמה מילים עליך:',
          '(עבודה, סגנון חיים, הריון, פציעות אם יש)',
          `✏️ תשובה חופשית: ${about || '—'}`,
          '',
          '✨ איך הגעת אלינו?',
          `${source || (source_other ? '5️⃣ אחר' : '—')}${source_other ? ' — ' + source_other : ''}`,
          '',
          '🔥 מתי נוח לך להגיע לאימונים?',
          `${time || '—'}`
        ].join('\n');

    // Send to Telegram
    const resp = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT,
        text: finalText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      // Bubble Telegram error back for debugging in Vercel logs
      return res.status(500).json({ error: 'Telegram send failed', details: data });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
}
