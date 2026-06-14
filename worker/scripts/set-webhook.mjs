/**
 * Usage (from worker/):
 *   $env:TELEGRAM_BOT_TOKEN="..."; node scripts/set-webhook.mjs https://sweet-mood-proxy.account.workers.dev/telegram-webhook
 */
const token = process.env.TELEGRAM_BOT_TOKEN
const webhookUrl = process.argv[2]

if (!token || !webhookUrl) {
  console.error('Usage: TELEGRAM_BOT_TOKEN=... node scripts/set-webhook.mjs <webhook-url>')
  process.exit(1)
}

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: webhookUrl,
    allowed_updates: ['inline_query', 'message'],
  }),
})

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
process.exit(data.ok ? 0 : 1)
