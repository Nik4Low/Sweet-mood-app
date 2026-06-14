export function buildMoodPrompt(userText, availableTags) {
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

export function buildTagsPrompt(name, description, vocabulary) {
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

export async function callGroq(env, prompt, maxTokens = 200) {
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
