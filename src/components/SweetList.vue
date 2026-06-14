<template>
  <div v-if="!sweets.length && !hideEmpty" class="empty">
    <div class="empty__icon">🍽️</div>
    <p>Пока пусто. Добавьте первую сладость!</p>
  </div>

  <div v-else class="sweet-list">
    <div
      v-for="sweet in sweets"
      :key="sweet.id"
      :ref="(el) => setItemRef(sweet.id, el)"
      class="sweet-list__item"
    >
      <SweetForm
        v-if="editingId === sweet.id"
        :key="sweet.id"
        :initial="sweet"
        :existing-tags="catalogTags"
        @save="$emit('save', $event)"
        @cancel="$emit('cancel')"
      />
      <article v-else class="card">
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
  </div>
</template>

<script>
import { watch, nextTick } from 'vue'
import SweetForm from './SweetForm.vue'

export default {
  name: 'SweetList',
  components: { SweetForm },
  props: {
    sweets: { type: Array, required: true },
    editingId: { type: String, default: null },
    catalogTags: { type: Array, default: () => [] },
    hideEmpty: { type: Boolean, default: false },
  },
  emits: ['edit', 'remove', 'save', 'cancel'],
  setup(props) {
    const itemRefs = new Map()

    function setItemRef(id, el) {
      if (el) itemRefs.set(id, el)
      else itemRefs.delete(id)
    }

    watch(
      () => props.editingId,
      async (id) => {
        if (!id) return
        await nextTick()
        itemRefs.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    )

    return { setItemRef }
  },
}
</script>

<style scoped>
.sweet-list__item + .sweet-list__item {
  margin-top: 0;
}
</style>
