XSAP Questionnaire → Telegram (Token Pre-filled)

What you need to do:
1) Open .env (already contains TELEGRAM_BOT_TOKEN). Replace TELEGRAM_CHAT_ID=REPLACE_WITH_YOUR_CHAT_ID
   - Get your chat id via: https://api.telegram.org/bot<BOT_TOKEN>/getUpdates after sending a message to the bot/chat.
2) On Vercel:
   - Upload this folder as a project (or push to Git and import).
   - In Settings → Environment Variables: copy the values from .env:
        TELEGRAM_BOT_TOKEN (already set)
        TELEGRAM_CHAT_ID (the number you found)
   - Redeploy.
3) Open /index.html and submit a test. Messages should arrive in your Telegram chat.

Security note:
- The token must NEVER be placed inside the HTML/JS on the client. Keep it only in server-side env vars.

NOTE:
- .env already contains TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.
- Add them in Vercel project settings (Environment Variables) before deploy.
- For security, consider regenerating the bot token in @BotFather after testing.
