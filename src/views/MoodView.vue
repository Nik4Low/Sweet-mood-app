<template>
  <MoodInput
    :model-value="modelValue"
    :loading="loading"
    :error="error"
    :has-sweets="hasSweets"
    @submit="$emit('submit', $event)"
  />
</template>

<script>
import MoodInput from '../components/MoodInput.vue'

export default {
  name: 'MoodView',
  components: { MoodInput },
  props: {
    modelValue: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hasSweets: { type: Boolean, default: true },
  },
  emits: ['submit'],
}
</script>
