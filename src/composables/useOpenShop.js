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

export function buildYandexLavkaSearchUrl(sweetName) {
  const q = encodeURIComponent(sweetName.trim())
  return `https://lavka.yandex.ru/search?text=${q}`
}

export function resolveShopUrl(sweet) {
  const custom = normalizeShopUrl(sweet.shopUrl)
  if (custom) return custom
  return buildYandexEdaSearchUrl(sweet.name)
}

export function openUrl(url) {
  if (WebApp.openLink) {
    WebApp.openLink(url)
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

export function openShopLink(sweet) {
  openUrl(resolveShopUrl(sweet))
}

export function openCustomShopLink(sweet) {
  const url = normalizeShopUrl(sweet.shopUrl)
  if (url) openUrl(url)
}

export function openEdaLink(sweet) {
  openUrl(buildYandexEdaSearchUrl(sweet.name))
}

export function openLavkaLink(sweet) {
  openUrl(buildYandexLavkaSearchUrl(sweet.name))
}
