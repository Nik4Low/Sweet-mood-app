import {
  buildMoodPrompt,
  buildTagsPrompt,
  extractGroqContent,
  parseMoodResponse,
  parseTagsResponse,
} from '../services/groqPrompt.js'

const WORKER_URL = import.meta.env.VITE_WORKER_URL
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_MODEL = 'llama-3.1-8b-instant'

async function callGroqChat(prompt, maxTokens = 200, retry = true) {
  if (!GROQ_API_KEY) {
    throw new Error('Не задан VITE_GROQ_API_KEY')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })

  const data = await response.json()

  if (response.status === 429 && retry) {
    await new Promise((r) => setTimeout(r, 2000))
    return callGroqChat(prompt, maxTokens, false)
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq error (${response.status})`)
  }

  return data
}

async function callWorker(endpoint, body, retry = true) {
  const base = WORKER_URL?.replace(/\/mood\/?$/, '') || WORKER_URL
  const url = endpoint === 'mood'
    ? (WORKER_URL || `${base}/mood`)
    : `${base}/${endpoint}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (response.status === 429 && retry) {
    await new Promise((r) => setTimeout(r, 2000))
    return callWorker(endpoint, body, false)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Ошибка сервера (${response.status})`)
  }

  return data
}

async function fetchMood(userText, availableTags) {
  if (WORKER_URL) {
    const data = await callWorker('mood', { userText, availableTags })
    return parseMoodResponse(extractGroqContent(data))
  }
  if (GROQ_API_KEY) {
    const data = await callGroqChat(buildMoodPrompt(userText, availableTags))
    return parseMoodResponse(extractGroqContent(data))
  }
  throw new Error('Не задан VITE_GROQ_API_KEY или VITE_WORKER_URL')
}

async function fetchSuggestedTags(name, description, vocabulary) {
  const payload = { name, description, vocabulary }

  if (WORKER_URL) {
    const data = await callWorker('tags', payload)
    return parseTagsResponse(extractGroqContent(data))
  }
  if (GROQ_API_KEY) {
    const data = await callGroqChat(buildTagsPrompt(name, description, vocabulary), 280)
    return parseTagsResponse(extractGroqContent(data))
  }
  throw new Error('Не задан VITE_GROQ_API_KEY или VITE_WORKER_URL')
}

export function useGroq() {
  async function analyzeMood(userText, availableTags) {
    return fetchMood(userText.trim(), availableTags)
  }

  async function suggestTags(name, description, vocabulary) {
    if (!name?.trim()) {
      throw new Error('Укажите название сладости')
    }
    return fetchSuggestedTags(name.trim(), description?.trim() || '', vocabulary)
  }

  return { analyzeMood, suggestTags }
}
