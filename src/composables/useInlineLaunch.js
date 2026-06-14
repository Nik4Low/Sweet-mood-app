import WebApp from '@twa-dev/sdk'

/** Текст настроения из inline @бот или start_param */
export function readInlineMoodText() {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('inline_mood')
  if (fromQuery?.trim()) return fromQuery.trim()

  const startParam = WebApp.initDataUnsafe?.start_param
  if (startParam?.trim()) {
    try {
      return decodeURIComponent(startParam.trim())
    } catch {
      return startParam.trim()
    }
  }

  return ''
}
