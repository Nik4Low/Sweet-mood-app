import { buildMoodPrompt, buildTagsPrompt, callGroq } from './groq.js'
import { handleTelegramUpdate } from './telegram.js'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data, status = 200, cors = true) {
  const headers = { 'Content-Type': 'application/json' }
  if (cors) Object.assign(headers, CORS_HEADERS)
  return new Response(JSON.stringify(data), { status, headers })
}

function routePath(url) {
  return url.pathname.replace(/\/+$/, '') || '/'
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = routePath(url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method === 'GET' && path.endsWith('/')) {
      return jsonResponse({
        ok: true,
        service: 'sweet-mood-proxy',
        routes: ['/telegram-webhook', '/mood', '/tags'],
      })
    }

    if (request.method === 'POST' && path.endsWith('/telegram-webhook')) {
      if (!env.TELEGRAM_BOT_TOKEN) {
        return jsonResponse({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500, false)
      }

      let update
      try {
        update = await request.json()
      } catch {
        return jsonResponse({ error: 'Invalid JSON' }, 400, false)
      }

      try {
        await handleTelegramUpdate(update, env)
      } catch (e) {
        console.error('Telegram update error:', e)
      }

      return new Response('OK', { status: 200 })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404)
    }

    const isMood = path.endsWith('/mood')
    const isTags = path.endsWith('/tags')

    if (!isMood && !isTags) {
      return jsonResponse({ error: 'Not found' }, 404)
    }

    if (!env.GROQ_API_KEY) {
      return jsonResponse({ error: 'GROQ_API_KEY not configured' }, 500)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400)
    }

    try {
      if (isMood) {
        const { userText, availableTags } = body
        if (!userText || typeof userText !== 'string' || !userText.trim()) {
          return jsonResponse({ error: 'userText is required' }, 400)
        }
        const tags = Array.isArray(availableTags) ? availableTags : []
        const result = await callGroq(env, buildMoodPrompt(userText.trim(), tags))
        if (result.error) return jsonResponse({ error: result.error }, result.status)
        return jsonResponse(result.data)
      }

      const { name, description, vocabulary } = body
      if (!name || typeof name !== 'string' || !name.trim()) {
        return jsonResponse({ error: 'name is required' }, 400)
      }
      const vocab = Array.isArray(vocabulary) ? vocabulary : []
      const result = await callGroq(
        env,
        buildTagsPrompt(name.trim(), description || '', vocab),
        150
      )
      if (result.error) return jsonResponse({ error: result.error }, result.status)
      return jsonResponse(result.data)
    } catch (e) {
      return jsonResponse({ error: e.message || 'Worker error' }, 500)
    }
  },
}
