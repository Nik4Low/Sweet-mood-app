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
