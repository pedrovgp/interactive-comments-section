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
  import { useTimeAgo } from '../composables/time-ago'

  const props = defineProps<{
    id: number
    user: IUser
    createdAt: number
    score: number
    content: string
  }>()

  const { state, isDataLoaded, hasReplies } = useState()
  const { activeId, actionType, currentUser } = toRefs(state)

  const content: Ref<string> = ref(props.content)

  const { humanReadableTime } = useTimeAgo()

  const isCurrentUser: ComputedRef<boolean> = computed((): boolean => {
    // TODO discover how to get current user from Django, to use here
    return isDataLoaded ? props.user.username === currentUser.value.username : false
  })

  const isReplying: ComputedRef<boolean> = computed((): boolean => {
    return activeId.value === props.id && actionType.value === REPLYING
  })
</script>

<template>
  <va-card stripe stripe-color="success">
    <va-card-title>{{ props.user.username }}: {{ humanReadableTime(createdAt) }} </va-card-title>
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
