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
    <div class="card__orders">
      <button
        type="button"
        class="btn btn--order"
        @click="handleOrder"
      >
        🛒 {{ sweet.shopUrl ? 'Купить' : 'Яндекс Еда' }}
      </button>
      <button
        type="button"
        class="btn btn--order btn--order-alt"
        @click="handleLavka"
      >
        🛒 Лавка
      </button>
    </div>
  </article>
</template>

<script>
import { openShopLink, openLavkaLink } from '../composables/useOpenShop.js'

export default {
  name: 'RecommendationCard',
  props: {
    sweet: { type: Object, required: true },
    rank: { type: Number, required: true },
    matchedTags: { type: Set, default: () => new Set() },
  },
  setup(props) {
    function handleOrder() {
      openShopLink(props.sweet)
    }

    function handleLavka() {
      openLavkaLink(props.sweet)
    }

    return { handleOrder, handleLavka }
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

.card__orders {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn--order {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius);
  background: rgba(108, 92, 231, 0.15);
  color: var(--tg-button);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.btn--order-alt {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.btn--order:active {
  opacity: 0.85;
}
</style>
