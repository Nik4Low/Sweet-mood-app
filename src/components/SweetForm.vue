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
      id="sweet-shop-url"
      v-model="form.shopUrl"
      label="Ссылка на товар"
      placeholder="https://eda.yandex.ru/..."
      hint="Яндекс Еда или другой магазин. Если пусто — поиск по названию"
    />

    <button
      type="button"
      class="btn btn--secondary btn--suggest"
      :disabled="suggesting || !form.name.trim()"
      @click="suggestTags"
    >
      <span v-if="suggesting" class="spinner spinner--sm" />
      <span>{{ suggesting ? 'Подбираем теги...' : '✨ Подобрать теги автоматически' }}</span>
    </button>

    <div class="field">
      <label class="field__label" for="sweet-tags">Теги настроения</label>
      <input
        id="sweet-tags"
        v-model="form.tagsInput"
        class="field__input"
        type="text"
        placeholder="появятся после подбора или введите вручную"
      />
      <p v-if="tagsHint" class="field__hint field__hint--ai">{{ tagsHint }}</p>
      <p v-else class="field__hint">Можно не заполнять — подберём при сохранении, если поле пустое</p>
      <p v-if="tagsError" class="field__error">{{ tagsError }}</p>
    </div>

    <div class="form-actions">
      <button v-if="editing" type="button" class="btn btn--secondary" @click="$emit('cancel')">
        Отмена
      </button>
      <button type="submit" class="btn btn--primary" :disabled="!form.name.trim() || suggesting">
        {{ editing ? 'Сохранить' : 'Добавить' }}
      </button>
    </div>
  </form>
</template>

<script>
import { reactive, ref, watch } from 'vue'
import FormField from './FormField.vue'
import { createSweet, tagsToInput, parseTagsInput, normalizeShopUrlField } from '../models/sweet.js'
import { mergeTagVocabulary } from '../models/tags.js'
import { useGroq } from '../composables/useGroq.js'

export default {
  name: 'SweetForm',
  components: { FormField },
  props: {
    initial: { type: Object, default: null },
    existingTags: { type: Array, default: () => [] },
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const editing = Boolean(props.initial)
    const { suggestTags: fetchTags } = useGroq()

    const form = reactive({
      name: props.initial?.name ?? '',
      description: props.initial?.description ?? '',
      shopUrl: props.initial?.shopUrl ?? '',
      tagsInput: props.initial ? tagsToInput(props.initial.tags) : '',
    })

    const suggesting = ref(false)
    const tagsHint = ref('')
    const tagsError = ref('')

    watch(
      () => props.initial,
      (val) => {
        if (val) {
          form.name = val.name
          form.description = val.description
          form.shopUrl = val.shopUrl ?? ''
          form.tagsInput = tagsToInput(val.tags)
          tagsHint.value = ''
          tagsError.value = ''
        }
      }
    )

    watch(
      () => form.tagsInput,
      () => {
        tagsError.value = ''
      }
    )

    async function suggestTags() {
      tagsError.value = ''
      tagsHint.value = ''
      suggesting.value = true
      try {
        const vocabulary = mergeTagVocabulary(props.existingTags)
        const result = await fetchTags(form.name, form.description, vocabulary)
        form.tagsInput = tagsToInput(result.tags)
        tagsHint.value = result.hint || 'Теги подобраны автоматически'
      } catch (e) {
        tagsError.value = e.message || 'Не удалось подобрать теги'
      } finally {
        suggesting.value = false
      }
    }

    async function ensureTags() {
      if (form.tagsInput.trim()) return parseTagsInput(form.tagsInput)
      await suggestTags()
      if (tagsError.value) throw new Error(tagsError.value)
      return parseTagsInput(form.tagsInput)
    }

    async function submit() {
      try {
        const tags = await ensureTags()
        const shopUrl = normalizeShopUrlField(form.shopUrl)
        if (props.initial) {
          emit('save', {
            ...props.initial,
            name: form.name.trim(),
            description: form.description.trim(),
            shopUrl,
            tags,
          })
        } else {
          emit('save', createSweet({
            name: form.name,
            description: form.description,
            shopUrl,
            tags,
          }))
        }
      } catch {
        /* tagsError already set */
      }
    }

    return {
      form,
      editing,
      suggesting,
      tagsHint,
      tagsError,
      suggestTags,
      submit,
    }
  },
}
</script>
