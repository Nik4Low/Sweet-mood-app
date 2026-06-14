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
  return `Ты помогаешь подобрать сладость по настроению пользователя.

Сладость: "${name}"
Описание: "${desc}"

Задача: по названию и описанию определи, при каких настроениях и состояниях человек захочет ЭТУ сладость.

Правила:
1. Проанализируй описание: вкус, текстура, температуру, сытность, ассоциации (шоколад, сливки, фрукты, выпечка).
2. Выбери 4–6 тегов: минимум 2 тега НАСТРОЕНИЯ (уют, грусть, усталость, радость, стресс, утешение, спокойствие, праздник, романтика, ностальгия, energy) и 1–2 тега ВКУСА/ХАРАКТЕРА (шоколад, сливочное, лёгкое, согревающее и т.д.) из списка.
3. Не ставь «радость» и «праздник» по умолчанию — только если описание правда про праздник или яркую радость.
4. Если сладость согревающая, сытная, домашняя — добавь: уют, утешение, усталость или грусть (подходит когда грустно/устал).
5. Если лёгкая, фруктовая, освежающая — добавь: лёгкое, освежающее, energy, радость.
6. Бери теги в первую очередь из списка. Можно добавить 1 новый короткий тег на русском, если нужно.
7. Теги — в нижнем регистре, без пробелов.

Доступные теги:
${tagsList}

Верни ТОЛЬКО JSON без markdown:
{
  "tags": ["тег1", "тег2", "тег3", "тег4"],
  "hint": "одно короткое предложение: почему эти теги подходят именно этой сладости"
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
