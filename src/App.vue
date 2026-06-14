<template>
  <div class="app">
    <header class="header">
      <h1 class="header__title">Сладость по настроению</h1>
      <p class="header__subtitle">Подберём десерт под ваше настроение</p>
    </header>

    <main class="main">
      <CatalogView
        v-show="activeTab === 'catalog'"
        :sweets="sweets"
        :loading="loadingCatalog"
        @update="persistSweets"
      />
      <MoodView
        v-show="activeTab === 'mood'"
        :model-value="moodText"
        :loading="analyzing"
        :error="moodError"
        :has-sweets="sweets.length > 0"
        @submit="handleSubmitMood"
      />
      <ResultView
        v-show="activeTab === 'result'"
        :mood-result="moodResult"
        :recommendations="recommendations"
        @retry="resetMood"
      />
    </main>

    <nav class="nav" role="navigation">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="nav__btn"
        :class="{ 'nav__btn--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="nav__icon">{{ tab.icon }}</span>
        <span class="nav__label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import WebApp from '@twa-dev/sdk'
import CatalogView from './views/CatalogView.vue'
import MoodView from './views/MoodView.vue'
import ResultView from './views/ResultView.vue'
import { useCloudStorage } from './composables/useCloudStorage.js'
import { useGroq } from './composables/useGroq.js'
import { collectAllTags, recommendSweets } from './composables/useRecommend.js'

const tabs = [
  { id: 'catalog', label: 'Сладости', icon: '🍰' },
  { id: 'mood', label: 'Настроение', icon: '💭' },
  { id: 'result', label: 'Итог', icon: '✨' },
]

export default {
  name: 'App',
  components: { CatalogView, MoodView, ResultView },
  setup() {
    const activeTab = ref('catalog')
    const sweets = ref([])
    const loadingCatalog = ref(true)
    const moodText = ref('')
    const analyzing = ref(false)
    const moodError = ref('')
    const moodResult = ref(null)
    const recommendations = ref({ items: [], noExactMatch: false, empty: false })

    const { loadSweets, saveSweets } = useCloudStorage()
    const { analyzeMood } = useGroq()

    function applyTheme() {
      const tp = WebApp.themeParams
      const root = document.documentElement
      if (tp.bg_color) root.style.setProperty('--tg-bg', tp.bg_color)
      if (tp.text_color) root.style.setProperty('--tg-text', tp.text_color)
      if (tp.hint_color) root.style.setProperty('--tg-hint', tp.hint_color)
      if (tp.button_color) root.style.setProperty('--tg-button', tp.button_color)
      if (tp.button_text_color) root.style.setProperty('--tg-button-text', tp.button_text_color)
      if (tp.secondary_bg_color) root.style.setProperty('--tg-secondary', tp.secondary_bg_color)
    }

    async function refreshCatalog() {
      loadingCatalog.value = true
      sweets.value = await loadSweets()
      loadingCatalog.value = false
    }

    async function persistSweets(next) {
      sweets.value = next
      await saveSweets(next)
    }

    async function handleSubmitMood(text) {
      moodText.value = text
      if (!sweets.value.length) {
        moodError.value = 'Сначала добавьте сладости в каталог'
        activeTab.value = 'catalog'
        return
      }

      analyzing.value = true
      moodError.value = ''
      moodResult.value = null

      try {
        const tags = collectAllTags(sweets.value)
        const result = await analyzeMood(text, tags)
        moodResult.value = result
        recommendations.value = recommendSweets(sweets.value, result)
        activeTab.value = 'result'
      } catch (e) {
        moodError.value = e.message || 'Не удалось проанализировать настроение'
      } finally {
        analyzing.value = false
      }
    }

    function resetMood() {
      moodText.value = ''
      moodResult.value = null
      moodError.value = ''
      recommendations.value = { items: [], noExactMatch: false, empty: false }
      activeTab.value = 'mood'
    }

    onMounted(() => {
      WebApp.ready()
      WebApp.expand()
      applyTheme()
      refreshCatalog()
    })

    return {
      tabs,
      activeTab,
      sweets,
      loadingCatalog,
      moodText,
      analyzing,
      moodError,
      moodResult,
      recommendations,
      persistSweets,
      handleSubmitMood,
      resetMood,
    }
  },
}
</script>
