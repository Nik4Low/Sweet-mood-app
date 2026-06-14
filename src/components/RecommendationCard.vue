<template>
  <article class="card">
    <div class="card__rank">#{{ rank }}</div>
    <h3 class="card__title">{{ sweet.name }}</h3>
    <p v-if="sweet.description" class="card__desc">{{ sweet.description }}</p>
    <div v-if="sweet.tags.length" class="tags">
      <span
        v-for="tag in sweet.tags"
        :key="tag"
        class="tag"
        :class="{ 'tag--match': matchedTags.has(tag.toLowerCase()) }"
      >
        {{ tag }}
      </span>
    </div>
  </article>
</template>

<script>
export default {
  name: 'RecommendationCard',
  props: {
    sweet: { type: Object, required: true },
    rank: { type: Number, required: true },
    matchedTags: { type: Set, default: () => new Set() },
  },
}
</script>

<style scoped>
.card__rank {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tg-button);
  margin-bottom: 4px;
}
</style>
