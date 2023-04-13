<script setup lang="ts">
  import { computed, toRefs } from 'vue'
  import type { ComputedRef } from 'vue'
  import { DELETING, EDITTING, REPLYING, STATUS_CHOICES, useState } from '../composables/state'
  import type { IUser } from '../interfaces/IUser'
  import type { IComment } from '../interfaces/IComment'

  const props = defineProps<{
    id: number
    user: IUser
    comment: IComment
  }>()

  const { state, changeStatus, isDataLoaded, setActive, toggleModal } = useState()
  const { currentUser } = toRefs(state)

  const isCurrentUser: ComputedRef<boolean> = computed((): boolean => {
    return isDataLoaded ? props.user.username === currentUser.value.username : false
  })

  const showModal = (): void => {
    setActive(props.id, DELETING)
    toggleModal(true)
  }

  const nextStatus = props.comment.status != null ? props.comment.status + 1 : 0
</script>

<template>
  <div class="comment-actions">
    <va-card-actions v-if="isCurrentUser">
      <va-button size="small" @click="setActive(props.id, EDITTING)">Editar</va-button>
      <va-button size="small" color="danger" @click="showModal">Apagar</va-button>
      <va-button
        v-if="
          props.comment.id != null && props.comment.parentId == null && props.comment.status != STATUS_CHOICES.ARCHIVED
        "
        size="small"
        color="primary"
        @click="changeStatus(props.comment.id, nextStatus)"
        >{{ props.comment.status == STATUS_CHOICES.NEW ? 'Marcar respondido' : 'Arquivar' }}</va-button
      >
    </va-card-actions>
    <va-card-actions v-else>
      <va-button size="small" @click="setActive(props.id, REPLYING)">Responder</va-button>
    </va-card-actions>
  </div>
</template>
