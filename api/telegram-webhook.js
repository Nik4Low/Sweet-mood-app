import { handleTelegramUpdate } from '../worker/src/telegram.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, service: 'sweet-mood-inline-webhook' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const miniAppUrl = process.env.MINI_APP_URL || 'https://nik4low.github.io/Sweet-mood-app/'

  if (!token) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not set' })
  }

  try {
    await handleTelegramUpdate(req.body, {
      TELEGRAM_BOT_TOKEN: token,
      MINI_APP_URL: miniAppUrl,
    })
  } catch (e) {
    console.error(e)
  }

  return res.status(200).send('OK')
}
