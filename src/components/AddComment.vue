<script setup lang="ts">
  import { ref } from 'vue'
  import type { Ref } from 'vue'
  import { useState } from '../composables/state'

  const props = withDefaults(
    defineProps<{
      buttonText: string
      parentId?: number | null
      label?: string
      placeholder?: string
    }>(),
    { parentId: null, label: 'Nova mensagem', placeholder: 'Escreva seu comentário ou dúvida' },
  )

  const { addComment, setActive } = useState()

  const content: Ref<string> = ref('')

  const post = (): void => {
    addComment(content.value, props.parentId)
    content.value = ''
    setActive(null, null)
  }
</script>

<template>
  <div class="add-comment">
    <va-card stripe stripe-color="primary">
      <va-card-content>
        <va-input
          v-model="content"
          class="mb-3"
          type="textarea"
          :label="props.label"
          :placeholder="props.placeholder"
        />
      </va-card-content>
      <va-card-actions>
        <va-button @click="post">{{ buttonText }}</va-button>
      </va-card-actions>
    </va-card>
  </div>
</template>

<style scoped>
  .add-comment {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
</style>
