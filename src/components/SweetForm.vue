<template>
  <form class="form-panel" @submit.prevent="submit">
    <h3 class="form-panel__title">
      {{ editing ? 'Редактировать сладость' : 'Новая сладость' }}
    </h3>

    <FormField
      id="sweet-name"
      v-model="form.name"
      label="Название"
      placeholder="Наполеон"
    />
    <FormField
      id="sweet-desc"
      v-model="form.description"
      label="Описание"
      placeholder="Слоёный сливочный торт"
      multiline
      :rows="2"
    />
    <FormField
      id="sweet-tags"
      v-model="form.tagsInput"
      label="Теги"
      placeholder="уют, сливочное, классика"
      hint="Через запятую — для подбора по настроению"
    />

    <div class="form-actions">
      <button v-if="editing" type="button" class="btn btn--secondary" @click="$emit('cancel')">
        Отмена
      </button>
      <button type="submit" class="btn btn--primary" :disabled="!form.name.trim()">
        {{ editing ? 'Сохранить' : 'Добавить' }}
      </button>
    </div>
  </form>
</template>

<script>
import { reactive, watch } from 'vue'
import FormField from './FormField.vue'
import { createSweet, tagsToInput, parseTagsInput } from '../models/sweet.js'

export default {
  name: 'SweetForm',
  components: { FormField },
  props: {
    initial: { type: Object, default: null },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const editing = Boolean(props.initial)

    const form = reactive({
      name: props.initial?.name ?? '',
      description: props.initial?.description ?? '',
      tagsInput: props.initial ? tagsToInput(props.initial.tags) : '',
    })

    watch(
      () => props.initial,
      (val) => {
        if (val) {
          form.name = val.name
          form.description = val.description
          form.tagsInput = tagsToInput(val.tags)
        }
      }
    )

    function submit() {
      const tags = parseTagsInput(form.tagsInput)
      if (props.initial) {
        emit('save', {
          ...props.initial,
          name: form.name.trim(),
          description: form.description.trim(),
          tags,
        })
      } else {
        emit('save', createSweet({
          name: form.name,
          description: form.description,
          tags,
        }))
      }
    }

    return { form, editing, submit }
  },
}
</script>
