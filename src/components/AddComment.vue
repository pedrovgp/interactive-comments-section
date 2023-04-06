<script setup lang="ts">
  import { computed, ref, toRefs } from 'vue'
  import type { ComputedRef, Ref } from 'vue'
  import { REPLYING, useState } from '../composables/state'

  const props = withDefaults(
    defineProps<{
      buttonText: string
      parentId?: number
      label?: string
      placeholder?: string
    }>(),
    { parentId: null, label: 'Nova mensagem', placeholder: 'Escreva seu comentário ou dúvida' },
  )

  const { state, addComment, setActive } = useState()
  const { activeId, actionType, currentUser } = toRefs(state)

  const content: Ref<string> = ref('')

  const post = (): void => {
    addComment(content.value, props.parentId)
    content.value = ''
    setActive(null, null)
  }
</script>

<template>
  <div class="add-comment">
    <va-card stripe stripe-color="blue">
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
