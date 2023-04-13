<script setup lang="ts">
  import { computed, toRefs } from 'vue'
  import type { ComputedRef } from 'vue'
  import Actions from './Actions.vue'
  import Content from './Content.vue'
  import AddComment from './AddComment.vue'
  import CommentList from './CommentList.vue'
  import type { IUser } from '../interfaces/IUser'
  import type { IComment } from '../interfaces/IComment'
  import { REPLYING, useState } from '../composables/state'

  const props = defineProps<{
    id: number
    user: IUser
    comment: IComment
  }>()

  const { state, hasReplies } = useState()
  const { activeId, actionType } = toRefs(state)

  function formatDate(date: string | null) {
    if (!date) {
      return ''
    }
    const d = new Date(date)
    // add two hours to the date, because the server is in UTC
    d.setHours(d.getHours() + 2)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const seconds = d.getSeconds()
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const isReplying: ComputedRef<boolean> = computed((): boolean => {
    return activeId.value === props.id && actionType.value === REPLYING
  })
</script>

<template>
  <va-card stripe stripe-color="success">
    <va-card-title>{{ props.user.username }}: {{ formatDate(props.comment.createdAt) }} </va-card-title>
    <va-card-content>
      <Content :id="props.id" :content="props.comment.content" />
      <Actions v-if="!isReplying" :id="props.id" :user="props.user" :comment="props.comment" />
      <AddComment
        v-if="isReplying"
        button-text="Responder"
        label="Nova resposta"
        placeholder="Escreva sua resposta"
        :parent-id="id"
      />
      <CommentList v-if="hasReplies(props.id)" :parent-id="props.id" />
    </va-card-content>
  </va-card>
</template>
