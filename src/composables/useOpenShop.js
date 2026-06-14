import WebApp from '@twa-dev/sdk'

export function normalizeShopUrl(url) {
  const trimmed = url?.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function buildYandexEdaSearchUrl(sweetName) {
  const q = encodeURIComponent(sweetName.trim())
  return `https://eda.yandex.ru/search?query=${q}`
}

export function resolveShopUrl(sweet) {
  const custom = normalizeShopUrl(sweet.shopUrl)
  if (custom) return custom
  return buildYandexEdaSearchUrl(sweet.name)
}

export function openShopLink(sweet) {
  const url = resolveShopUrl(sweet)
  if (WebApp.openLink) {
    WebApp.openLink(url)
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
