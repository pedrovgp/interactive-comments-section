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
    <!-- <picture class="avatar"
      ><source type="image/webp" :srcset="currentUser.image!.webp" />
      <source type="image/png" :srcset="currentUser.image!.png" />
      <img :src="currentUser.image!.png" :alt="`${currentUser.username}'s avatar`" />
    </picture> -->
    <va-input v-model="content" class="mb-3" type="textarea" :label="props.label" :placeholder="props.placeholder" />
    <va-button @click="post">{{ buttonText }}</va-button>
  </div>
</template>
