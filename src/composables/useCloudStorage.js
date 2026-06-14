import WebApp from '@twa-dev/sdk'
import { STORAGE_KEY } from '../models/sweet.js'

const FALLBACK_PREFIX = 'sweet_mood_'

function useTelegramStorage() {
  return Boolean(WebApp.CloudStorage?.getItem && WebApp.CloudStorage?.setItem)
}

function readLocal() {
  try {
    const raw = localStorage.getItem(FALLBACK_PREFIX + STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(data) {
  localStorage.setItem(FALLBACK_PREFIX + STORAGE_KEY, JSON.stringify(data))
}

function cloudGet(key) {
  return new Promise((resolve, reject) => {
    WebApp.CloudStorage.getItem(key, (err, value) => {
      if (err) reject(err)
      else resolve(value ?? null)
    })
  })
}

function cloudSet(key, value) {
  return new Promise((resolve, reject) => {
    WebApp.CloudStorage.setItem(key, value, (err, ok) => {
      if (err) reject(err)
      else resolve(ok)
    })
  })
}

export function useCloudStorage() {
  async function loadSweets() {
    if (useTelegramStorage()) {
      try {
        const raw = await cloudGet(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
      } catch {
        /* fallback below */
      }
    }
    return readLocal()
  }

  async function saveSweets(sweets) {
    const payload = JSON.stringify(sweets)
    writeLocal(sweets)
    if (useTelegramStorage()) {
      try {
        await cloudSet(STORAGE_KEY, payload)
      } catch {
        /* localStorage already saved */
      }
    }
  }

  return { loadSweets, saveSweets }
}
