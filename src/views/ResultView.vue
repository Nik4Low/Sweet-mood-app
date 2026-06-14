<template>
  <section class="panel">
    <div v-if="!moodResult" class="empty">
      <div class="empty__icon">✨</div>
      <p>Опишите настроение во вкладке «Настроение», и мы подберём сладость.</p>
    </div>

    <template v-else>
      <div class="mood-summary">
        <div class="mood-summary__label">Ваше настроение</div>
        <p class="mood-summary__text">{{ moodResult.mood }}</p>
        <p v-if="moodResult.explanation" class="card__desc" style="margin-top: 8px; margin-bottom: 0">
          {{ moodResult.explanation }}
        </p>
      </div>

      <div v-if="recommendations.noExactMatch" class="alert alert--info">
        Точного совпадения нет — вот что есть в каталоге:
      </div>

      <h2 class="section-header__title" style="margin-bottom: 12px">Рекомендации</h2>

      <RecommendationCard
        v-for="(item, index) in recommendations.items"
        :key="item.sweet.id"
        :sweet="item.sweet"
        :rank="index + 1"
        :matched-tags="matchedTagSet"
      />

      <button type="button" class="btn btn--secondary" style="width: 100%; margin-top: 8px" @click="$emit('retry')">
        Попробовать снова
      </button>
    </template>
  </section>
</template>

<script>
import { computed } from 'vue'
import RecommendationCard from '../components/RecommendationCard.vue'

export default {
  name: 'ResultView',
  components: { RecommendationCard },
  props: {
    moodResult: { type: Object, default: null },
    recommendations: {
      type: Object,
      default: () => ({ items: [], noExactMatch: false, empty: false }),
    },
  },
  emits: ['retry'],
  setup(props) {
    const matchedTagSet = computed(
      () => new Set((props.moodResult?.matchedTags || []).map((t) => t.toLowerCase()))
    )
    return { matchedTagSet }
  },
}
</script>
