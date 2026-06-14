import {
  buildMoodPrompt,
  extractGroqContent,
  parseMoodResponse,
} from '../services/groqPrompt.js'

const WORKER_URL = import.meta.env.VITE_WORKER_URL
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_MODEL = 'llama-3.1-8b-instant'

async function callGroqDirect(userText, availableTags, retry = true) {
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
      messages: [{ role: 'user', content: buildMoodPrompt(userText, availableTags) }],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    }),
  })

  const data = await response.json()

  if (response.status === 429 && retry) {
    await new Promise((r) => setTimeout(r, 2000))
    return callGroqDirect(userText, availableTags, false)
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq error (${response.status})`)
  }

  return parseMoodResponse(extractGroqContent(data))
}

async function callGroqViaWorker(userText, availableTags, retry = true) {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userText, availableTags }),
  })

  const data = await response.json()

  if (response.status === 429 && retry) {
    await new Promise((r) => setTimeout(r, 2000))
    return callGroqViaWorker(userText, availableTags, false)
  }

  if (!response.ok) {
    throw new Error(data?.error || `Ошибка сервера (${response.status})`)
  }

  return parseMoodResponse(extractGroqContent(data))
}

async function fetchMood(userText, availableTags) {
  if (WORKER_URL) {
    return callGroqViaWorker(userText, availableTags)
  }
  if (GROQ_API_KEY) {
    return callGroqDirect(userText, availableTags)
  }
  throw new Error('Не задан VITE_GROQ_API_KEY или VITE_WORKER_URL')
}

export function useGroq() {
  async function analyzeMood(userText, availableTags) {
    return fetchMood(userText.trim(), availableTags)
  }

  return { analyzeMood }
}
