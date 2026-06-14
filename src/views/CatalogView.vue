<template>
  <section class="panel">
    <div v-if="loading" class="empty">
      <span class="spinner" />
      <p>Загрузка каталога...</p>
    </div>

    <template v-else>
      <div class="section-header">
        <h2 class="section-header__title">Мои сладости ({{ sweets.length }})</h2>
        <button
          v-if="!formMode"
          type="button"
          class="btn btn--primary"
          style="width: auto; padding: 8px 16px; font-size: 0.875rem"
          @click="openAdd"
        >
          + Добавить
        </button>
      </div>

      <p v-if="!formMode && !sweets.length" class="catalog-hint">
        Нажмите «+ Добавить» — теги настроения подберутся автоматически
      </p>

      <SweetForm
        v-if="formMode === 'add'"
        key="add"
        :existing-tags="catalogTags"
        @save="handleSave"
        @cancel="closeForm"
      />

      <SweetList
        :sweets="sweets"
        :editing-id="editingId"
        :catalog-tags="catalogTags"
        :hide-empty="formMode === 'add'"
        @edit="openEdit"
        @remove="handleRemove"
        @save="handleSave"
        @cancel="closeForm"
      />
    </template>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import SweetForm from '../components/SweetForm.vue'
import SweetList from '../components/SweetList.vue'
import { collectAllTags } from '../composables/useRecommend.js'

export default {
  name: 'CatalogView',
  components: { SweetForm, SweetList },
  props: {
    sweets: { type: Array, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update'],
  setup(props, { emit }) {
    /** null — форма закрыта, 'add' — новая сладость, иначе id редактируемой */
    const formMode = ref(null)
    const catalogTags = computed(() => collectAllTags(props.sweets))
    const editingId = computed(() =>
      formMode.value && formMode.value !== 'add' ? formMode.value : null
    )

    function openAdd() {
      formMode.value = 'add'
    }

    function openEdit(sweet) {
      formMode.value = sweet.id
    }

    function closeForm() {
      formMode.value = null
    }

    function handleSave(sweet) {
      let next
      if (formMode.value === 'add') {
        next = [...props.sweets, sweet]
      } else {
        next = props.sweets.map((s) => (s.id === sweet.id ? sweet : s))
      }
      emit('update', next)
      closeForm()
    }

    function handleRemove(id) {
      if (formMode.value === id) closeForm()
      emit('update', props.sweets.filter((s) => s.id !== id))
    }

    return {
      formMode,
      editingId,
      catalogTags,
      openAdd,
      openEdit,
      closeForm,
      handleSave,
      handleRemove,
    }
  },
}
</script>
