/** Базовый словарь тегов настроения — Groq выбирает из него + уже использованные в каталоге */
export const DEFAULT_MOOD_TAGS = [
  'уют',
  'радость',
  'грусть',
  'стресс',
  'усталость',
  'праздник',
  'романтика',
  'ностальгия',
  'energy',
  'лёгкое',
  'сытное',
  'шоколад',
  'фрукт',
  'сливочное',
  'орехи',
  'карамель',
  'кислое',
  'освежающее',
  'согревающее',
  'классика',
  'новинка',
]

export function mergeTagVocabulary(existingTags = []) {
  const set = new Set(DEFAULT_MOOD_TAGS.map((t) => t.toLowerCase()))
  for (const tag of existingTags) {
    set.add(String(tag).toLowerCase())
  }
  return [...set]
}
