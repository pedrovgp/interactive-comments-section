<script setup lang="ts">
  import { computed, ref, toRefs } from 'vue'
  import type { ComputedRef, Ref } from 'vue'
  import Actions from './Actions.vue'
  import Content from './Content.vue'
  import AddComment from './AddComment.vue'
  import Score from './Score.vue'
  import CommentList from './CommentList.vue'
  import type { IUser } from '../interfaces/IUser'
  import { REPLYING, useState } from '../composables/state'

  const props = defineProps<{
    id: number
    user: IUser
    createdAt: string | null
    score: number
    content: string
  }>()

  const { state, isDataLoaded, hasReplies } = useState()
  const { activeId, actionType, currentUser } = toRefs(state)

  const content: Ref<string> = ref(props.content)

  const isCurrentUser: ComputedRef<boolean> = computed((): boolean => {
    // TODO discover how to get current user from Django, to use here
    return isDataLoaded ? props.user.username === currentUser.value.username : false
  })

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
    <va-card-title>{{ props.user.username }}: {{ formatDate(createdAt) }} </va-card-title>
    <va-card-content>
      <Content :id="props.id" :content="props.content" />
      <Actions v-if="!isReplying" :id="props.id" :user="props.user" />
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
