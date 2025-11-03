export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, age, location, experience, about, source, timing } = req.body;

  const message = `
📋 *XSAP New Form Submission:*
👤 Name: ${name}
🎂 Age: ${age}
📍 Location: ${location}
🏋️‍♀️ Experience: ${experience}
💬 About: ${about}
✨ Source: ${source}
🔥 Preferred Time: ${timing}
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) throw new Error('Telegram API error');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}