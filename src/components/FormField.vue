<template>
  <div class="field">
    <label class="field__label" :for="id">{{ label }}</label>
    <component
      :is="multiline ? 'textarea' : 'input'"
      :id="id"
      class="field__input"
      :class="{ 'field__textarea': multiline }"
      :type="multiline ? undefined : type"
      :rows="multiline ? rows : undefined"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<script>
export default {
  name: 'FormField',
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    hint: { type: String, default: '' },
    multiline: { type: Boolean, default: false },
    rows: { type: Number, default: 3 },
    type: { type: String, default: 'text' },
  },
  emits: ['update:modelValue'],
}
</script>
