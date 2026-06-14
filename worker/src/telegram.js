const TG_API = 'https://api.telegram.org/bot'

export async function tgCall(token, method, body) {
  const res = await fetch(`${TG_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.ok) {
    throw new Error(data.description || `Telegram API ${method} failed`)
  }
  return data.result
}

function buildAppUrl(baseUrl, moodQuery) {
  const url = new URL(baseUrl)
  url.searchParams.set('v', '3')
  const text = moodQuery?.trim()
  if (text) {
    url.searchParams.set('inline_mood', text.slice(0, 200))
  }
  return url.toString()
}

function buildInlineResults(miniAppUrl, query) {
  const moodText = query?.trim() || ''
  const appUrl = buildAppUrl(miniAppUrl, moodText)
  const title = moodText ? '🍰 Сладость по настроению' : '🍰 Подобрать сладость'
  const description = moodText
    ? moodText.slice(0, 120)
    : 'Откройте Mini App и опишите настроение'
  const messageText = moodText
    ? `🍰 Подберём сладость под настроение: «${moodText.slice(0, 100)}»`
    : '🍰 Подберём сладость под ваше настроение — нажмите кнопку ниже'

  return [
    {
      type: 'article',
      id: `mood-${Date.now()}`,
      title,
      description,
      input_message_content: {
        message_text: messageText,
      },
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✨ Открыть приложение',
              web_app: { url: appUrl },
            },
          ],
        ],
      },
    },
  ]
}

async function handleInlineQuery(inlineQuery, env) {
  const token = env.TELEGRAM_BOT_TOKEN
  const miniAppUrl = env.MINI_APP_URL
  if (!token || !miniAppUrl) {
    console.error('Missing TELEGRAM_BOT_TOKEN or MINI_APP_URL')
    return
  }

  const results = buildInlineResults(miniAppUrl, inlineQuery.query || '')
  await tgCall(token, 'answerInlineQuery', {
    inline_query_id: inlineQuery.id,
    results,
    cache_time: 0,
    is_personal: true,
  })
}

export async function handleTelegramUpdate(update, env) {
  if (update.inline_query) {
    await handleInlineQuery(update.inline_query, env)
    return
  }

  if (update.message?.text?.startsWith('/start')) {
    const token = env.TELEGRAM_BOT_TOKEN
    const miniAppUrl = buildAppUrl(env.MINI_APP_URL, '')
    if (!token || !miniAppUrl) return

    await tgCall(token, 'sendMessage', {
      chat_id: update.message.chat.id,
      text: '🍰 Привет! Напишите @бот mood в любом чате или нажмите кнопку ниже.',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✨ Открыть приложение', web_app: { url: miniAppUrl } }],
        ],
      },
    })
  }
}

export async function setTelegramWebhook(token, webhookUrl) {
  return tgCall(token, 'setWebhook', {
    url: webhookUrl,
    allowed_updates: ['inline_query', 'message'],
  })
}
