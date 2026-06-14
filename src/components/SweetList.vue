<template>
  <div v-if="!sweets.length" class="empty">
    <div class="empty__icon">🍽️</div>
    <p>Пока пусто. Добавьте первую сладость!</p>
  </div>

  <div v-else>
    <article v-for="sweet in sweets" :key="sweet.id" class="card">
      <h3 class="card__title">{{ sweet.name }}</h3>
      <p v-if="sweet.description" class="card__desc">{{ sweet.description }}</p>
      <div v-if="sweet.tags.length" class="tags">
        <span v-for="tag in sweet.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="card__actions">
        <button type="button" class="btn btn--ghost" @click="$emit('edit', sweet)">
          Изменить
        </button>
        <button type="button" class="btn btn--danger" @click="$emit('remove', sweet.id)">
          Удалить
        </button>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'SweetList',
  props: {
    sweets: { type: Array, required: true },
  },
  emits: ['edit', 'remove'],
}
</script>
