function buildPrompt(userText, availableTags) {
  const tagsList = availableTags?.length ? availableTags.join(', ') : 'нет тегов'
  return `Пользователь написал: "${userText}"
Доступные теги сладостей: ${tagsList}

Проанализируй настроение и выбери подходящие теги из списка доступных.
Верни ТОЛЬКО JSON без markdown:
{
  "mood": "кратко на русском",
  "energy": "low|medium|high",
  "matchedTags": ["тег1", "тег2"],
  "explanation": "одно предложение почему"
}`
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || !url.pathname.endsWith('/mood')) {
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

    const { userText, availableTags } = body
    if (!userText || typeof userText !== 'string' || !userText.trim()) {
      return jsonResponse({ error: 'userText is required' }, 400)
    }

    const tags = Array.isArray(availableTags) ? availableTags : []

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: buildPrompt(userText.trim(), tags) }],
          temperature: 0.3,
          max_tokens: 200,
          response_format: { type: 'json_object' },
        }),
      })

      const data = await groqRes.json()

      if (!groqRes.ok) {
        return jsonResponse(
          { error: data?.error?.message || 'Groq API error' },
          groqRes.status
        )
      }

      return jsonResponse(data)
    } catch (e) {
      return jsonResponse({ error: e.message || 'Worker error' }, 500)
    }
  },
}
