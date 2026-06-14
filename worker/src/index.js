function buildMoodPrompt(userText, availableTags) {
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

function buildTagsPrompt(name, description, vocabulary) {
  const tagsList = vocabulary?.length ? vocabulary.join(', ') : 'нет списка'
  const desc = description?.trim() || 'не указано'
  return `Сладость: "${name}"
Описание: "${desc}"

Подбери 3–5 тегов, описывающих к какому настроению подходит эта сладость.
Выбирай из списка (можно добавить 1–2 новых коротких тега на русском, если нужно):
${tagsList}

Теги должны помогать подбирать сладость по настроению (усталость, радость, уют, стресс и т.д.).

Верни ТОЛЬКО JSON без markdown:
{
  "tags": ["тег1", "тег2", "тег3"],
  "hint": "одно короткое предложение почему эти теги"
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

async function callGroq(env, prompt, maxTokens = 200) {
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  const data = await groqRes.json()

  if (!groqRes.ok) {
    return { error: data?.error?.message || 'Groq API error', status: groqRes.status }
  }

  return { data }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Not found' }, 404)
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')
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
