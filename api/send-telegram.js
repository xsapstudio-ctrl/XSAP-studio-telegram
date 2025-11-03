export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    let text = body.text;

    if (!text) {
      const {
        name = '', age = '', location = '', experience = '',
        about = '', source = '', source_other = '', time: timing = ''
      } = body;
      const src = source || (source_other ? `אחר: ${source_other}` : '');
      text = [
        '📝 שאלון XSAP — תשובות:',
        `👤 שם: ${name}`,
        `🎂 גיל: ${age}`,
        `📍 מאיפה: ${location}`,
        `🏋️‍♀️ ניסיון: ${experience}`,
        `💬 עליך: ${about || '—'}`,
        `✨ מקור הגעה: ${src}`,
        `🔥 זמן נוח: ${timing}`
      ].join('\n');
    }

    const resp = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await resp.json();
    if (!resp.ok || !data.ok) {
      return res.status(500).json({ error: 'Telegram send failed', details: data });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
}
