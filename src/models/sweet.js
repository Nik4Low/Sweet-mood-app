export const STORAGE_KEY = 'sweets_catalog'

export function createSweet({ name, description, tags, shopUrl = '' }) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    description: description.trim(),
    tags: normalizeTags(tags),
    shopUrl: normalizeShopUrlField(shopUrl),
  }
}

export function normalizeShopUrlField(url) {
  const trimmed = String(url ?? '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
  }
  return String(tags)
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export function parseTagsInput(value) {
  return normalizeTags(value)
}

export function tagsToInput(tags) {
  return tags.join(', ')
}
