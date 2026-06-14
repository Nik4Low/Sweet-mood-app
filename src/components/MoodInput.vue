<template>
  <section class="panel">
    <FormField
      id="mood-text"
      :model-value="text"
      label="Как вы себя чувствуете?"
      placeholder="Например: устал после работы, хочется чего-то уютного..."
      multiline
      :rows="4"
      @update:model-value="text = $event"
    />

    <div v-if="error" class="alert alert--error">{{ error }}</div>
    <div v-else-if="!hasSweets" class="alert alert--info">
      Добавьте сладости во вкладке «Сладости», чтобы получить рекомендацию.
    </div>

    <button
      type="button"
      class="btn btn--primary"
      :disabled="loading || !text.trim() || !hasSweets"
      @click="submit"
    >
      <span v-if="loading" class="spinner" />
      <span>{{ loading ? 'Анализируем...' : 'Подобрать сладость' }}</span>
    </button>
  </section>
</template>

<script>
import { ref, watch } from 'vue'
import FormField from './FormField.vue'

export default {
  name: 'MoodInput',
  components: { FormField },
  props: {
    modelValue: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hasSweets: { type: Boolean, default: true },
  },
  emits: ['submit'],
  setup(props, { emit }) {
    const text = ref(props.modelValue)

    watch(
      () => props.modelValue,
      (v) => {
        text.value = v
      }
    )

    function submit() {
      if (text.value.trim()) emit('submit', text.value.trim())
    }

    return { text, submit }
  },
}
</script>
