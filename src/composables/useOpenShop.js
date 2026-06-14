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

/** Web fallback — в браузере работает, но из Telegram часто теряет запрос при переходе в приложение */
export function buildYandexLavkaSearchUrl(sweetName) {
  const q = encodeURIComponent(sweetName.trim())
  return `https://lavka.yandex.ru/search?text=${q}`
}

/**
 * Deep link в приложение Лавки (сохраняет поисковый запрос).
 * Структура повторяет web-URL — так роутит WebView-обёртка Яндекса.
 */
export function buildYandexLavkaDeepLink(sweetName) {
  const q = encodeURIComponent(sweetName.trim())
  return `yandexlavka://lavka.yandex.ru/search?text=${q}`
}

/**
 * Ссылка для открытия Лавки с учётом платформы.
 * eda.yandex.ru открывается в приложении через App Links;
 * lavka.yandex.ru из Telegram часто уходит в браузер — используем native scheme.
 */
export function buildYandexLavkaOpenUrl(sweetName) {
  const q = encodeURIComponent(sweetName.trim())
  const httpsFallback = buildYandexLavkaSearchUrl(sweetName)
  const deepLink = buildYandexLavkaDeepLink(sweetName)
  const platform = WebApp.platform || ''

  if (platform === 'android') {
    const fallback = encodeURIComponent(httpsFallback)
    return `intent://lavka.yandex.ru/search?text=${q}#Intent;scheme=yandexlavka;package=com.yandex.lavka;S.browser_fallback_url=${fallback};end`
  }

  if (platform === 'ios') {
    return deepLink
  }

  return deepLink
}

export function resolveShopUrl(sweet) {
  const custom = normalizeShopUrl(sweet.shopUrl)
  if (custom) return custom
  return buildYandexEdaSearchUrl(sweet.name)
}

function isNativeDeepLink(url) {
  return /^(yandexlavka|intent):/i.test(url)
}

export function openUrl(url) {
  if (WebApp.openLink) {
    WebApp.openLink(url)
  } else {
    window.open(url, '_blank', 'noopener')
  }
}

/** Native scheme / intent — напрямую в ОС, без принудительного браузера Telegram */
function openNativeLink(url) {
  if (isNativeDeepLink(url)) {
    window.location.assign(url)
    return
  }
  openUrl(url)
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
  openNativeLink(buildYandexLavkaOpenUrl(sweet.name))
}
