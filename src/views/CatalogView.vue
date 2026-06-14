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
          v-if="!showForm"
          type="button"
          class="btn btn--primary"
          style="width: auto; padding: 8px 16px; font-size: 0.875rem"
          @click="openAdd"
        >
          + Добавить
        </button>
      </div>

      <SweetForm
        v-if="showForm"
        :initial="editingSweet"
        @save="handleSave"
        @cancel="closeForm"
      />

      <SweetList
        :sweets="sweets"
        @edit="openEdit"
        @remove="handleRemove"
      />
    </template>
  </section>
</template>

<script>
import { ref } from 'vue'
import SweetForm from '../components/SweetForm.vue'
import SweetList from '../components/SweetList.vue'

export default {
  name: 'CatalogView',
  components: { SweetForm, SweetList },
  props: {
    sweets: { type: Array, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const showForm = ref(false)
    const editingSweet = ref(null)

    function openAdd() {
      editingSweet.value = null
      showForm.value = true
    }

    function openEdit(sweet) {
      editingSweet.value = sweet
      showForm.value = true
    }

    function closeForm() {
      showForm.value = false
      editingSweet.value = null
    }

    function handleSave(sweet) {
      let next
      if (editingSweet.value) {
        next = props.sweets.map((s) => (s.id === sweet.id ? sweet : s))
      } else {
        next = [...props.sweets, sweet]
      }
      emit('update', next)
      closeForm()
    }

    function handleRemove(id) {
      emit('update', props.sweets.filter((s) => s.id !== id))
    }

    return {
      showForm,
      editingSweet,
      openAdd,
      openEdit,
      closeForm,
      handleSave,
      handleRemove,
    }
  },
}
</script>
