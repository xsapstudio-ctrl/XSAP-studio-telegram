'use strict';

// Vercel serverless function: sends form answers via Telegram without exposing the bot token.
const allowed = {
  activity: ['לא מתאמן/ת כרגע', 'מתאמן/ת מדי פעם', 'מתאמן/ת באופן קבוע'],
  experience: ['ללא ניסיון קודם', 'אימוני כוח / חדר כושר', 'אימונים פונקציונליים / HIIT', 'פילאטיס / יוגה', 'ספינינג / רכיבה', 'ריצה / פעילות אירובית', 'אחר'],
  medical: ['לא', 'כן'],
  interests: ['אימוני כוח', 'ספינינג', 'פילאטיס', 'הכול מהכול! 😍'],
  times: ['בוקר', 'ערב', 'משתנה משבוע לשבוע'],
  source: ['המלצה', 'איזי', 'גוגל', 'אינסטגרם', 'עברתי וראיתי (: ']
};

const str = (x, max=100) => typeof x === 'string' ? x.trim().slice(0, max) : '';
const clean = (text) => str(text, 500).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const oneOf = (x, options) => typeof x === 'string' && options.includes(x);
const group = (x, options) => Array.isArray(x) && x.length > 0 && x.length <= options.length && x.every(v => oneOf(v, options)) && new Set(x).size === x.length;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error:'method_not_allowed'}); }
  const body = req.body || {};
  if (typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({error:'invalid_payload'});
  // Bot-field: reject automated form submissions without sending them to Telegram.
  if (body.website) return res.status(200).json({ok:true});
  const name = str(body.fullName, 100);
  const age = body.age;
  if (name.length < 2 || name.length > 100 || !Number.isInteger(age) || age < 10 || age > 110 ||
      !oneOf(body.activity, allowed.activity) || !group(body.experience, allowed.experience) ||
      !oneOf(body.medical, allowed.medical) || !group(body.interests, allowed.interests) ||
      !oneOf(body.times, allowed.times) || !oneOf(body.source, allowed.source) ||
      (body.experience.includes('ללא ניסיון קודם') && body.experience.length > 1) ||
      (body.interests.includes('הכול מהכול! 😍') && body.interests.length > 1) ||
      (body.experience.includes('אחר') && !str(body.experienceOther, 180)) ||
      (body.medical === 'כן' && !str(body.medicalDetails, 500))) {
    return res.status(400).json({error:'invalid_answers'});
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(503).json({error:'not_configured'});
  const text = [
    '❤️ <b>ליד חדש · XSAP Studio</b>',
    '━━━━━━━━━━━━━━━━',
    `👤 <b>שם מלא:</b> ${clean(name)}`,
    `🎂 <b>גיל:</b> ${age}`,
    `🏋️ <b>מצב אימונים:</b> ${clean(body.activity)}`,
    `💪 <b>ניסיון:</b> ${body.experience.map(clean).join(' · ')}${body.experience.includes('אחר') ? '\n   ↳ ' + clean(str(body.experienceOther, 180)) : ''}`,
    `🩺 <b>מגבלה שכדאי להכיר:</b> ${clean(body.medical)}${body.medical === 'כן' ? '\n   ↳ ' + clean(str(body.medicalDetails, 500)) : ''}`,
    `🔥 <b>תחומי עניין:</b> ${body.interests.map(clean).join(' · ')}`,
    `🕒 <b>שעות מועדפות:</b> ${clean(body.times)}`,
    `✨ <b>מקור הגעה:</b> ${clean(body.source)}`,
    '━━━━━━━━━━━━━━━━',
    'נשלח מטופס ההיכרות של XSAP'
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({chat_id:chatId, text, parse_mode:'HTML', disable_web_page_preview:true}),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      console.error('Telegram delivery error', response.status, result?.error_code || 'unknown');
      return res.status(502).json({error:'delivery_failed'});
    }
    return res.status(200).json({ok:true});
  } catch (error) {
    console.error('Telegram request failed', error?.name || 'error');
    return res.status(502).json({error:'delivery_failed'});
  }
};
