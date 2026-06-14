function moodWords(mood) {
  return mood
    .toLowerCase()
    .split(/[\s,.;:!?—–-]+/)
    .filter((w) => w.length > 2)
}

function countPartialMatches(words, text) {
  const hay = text.toLowerCase()
  return words.reduce((acc, word) => (hay.includes(word) ? acc + 1 : acc), 0)
}

export function recommendSweets(sweets, moodResult) {
  if (!sweets.length) {
    return { items: [], noExactMatch: false, empty: true }
  }

  const matchedTags = new Set(
    (moodResult.matchedTags || []).map((t) => t.toLowerCase())
  )
  const words = moodWords(moodResult.mood || '')

  const scored = sweets.map((sweet) => {
    const sweetTags = new Set(sweet.tags.map((t) => t.toLowerCase()))
    let tagScore = 0
    for (const tag of matchedTags) {
      if (sweetTags.has(tag)) tagScore += 2
    }

    const descScore = countPartialMatches(words, sweet.description)
    const nameScore = countPartialMatches(words, sweet.name)
    const energyBonus =
      moodResult.energy === 'low' && sweetTags.has('уют') ? 1 : 0

    return {
      sweet,
      score: tagScore + descScore + nameScore + energyBonus,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter((s) => s.score > 0).slice(0, 3)
  const noExactMatch = top.length === 0

  const items = noExactMatch
    ? scored.slice(0, 3).map((s) => ({ ...s, score: 0 }))
    : top

  return { items, noExactMatch, empty: false }
}

export function collectAllTags(sweets) {
  const set = new Set()
  for (const sweet of sweets) {
    for (const tag of sweet.tags) set.add(tag)
  }
  return [...set]
}
