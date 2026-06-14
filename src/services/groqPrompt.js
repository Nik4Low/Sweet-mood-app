export function buildMoodPrompt(userText, availableTags) {
  const tagsList = availableTags.length ? availableTags.join(', ') : 'нет тегов'
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

export function parseMoodResponse(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Пустой ответ от модели')
  }

  let text = rawContent.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) text = fence[1].trim()

  const parsed = JSON.parse(text)

  if (!parsed.mood || !Array.isArray(parsed.matchedTags)) {
    throw new Error('Некорректный формат ответа')
  }

  return {
    mood: String(parsed.mood),
    energy: ['low', 'medium', 'high'].includes(parsed.energy)
      ? parsed.energy
      : 'medium',
    matchedTags: parsed.matchedTags.map((t) => String(t).toLowerCase()),
    explanation: String(parsed.explanation || ''),
  }
}

export function extractGroqContent(groqPayload) {
  const content = groqPayload?.choices?.[0]?.message?.content
  if (!content) {
    const errMsg = groqPayload?.error?.message
    throw new Error(errMsg || 'Groq не вернул ответ')
  }
  return content
}

export function buildTagsPrompt(name, description, vocabulary) {
  const tagsList = vocabulary.length ? vocabulary.join(', ') : 'нет списка'
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

export function parseTagsResponse(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('Пустой ответ от модели')
  }

  let text = rawContent.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) text = fence[1].trim()

  const parsed = JSON.parse(text)

  if (!Array.isArray(parsed.tags) || !parsed.tags.length) {
    throw new Error('Модель не вернула теги')
  }

  return {
    tags: parsed.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean),
    hint: String(parsed.hint || ''),
  }
}
