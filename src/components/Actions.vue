<script setup lang="ts">
  import { computed, toRefs } from 'vue'
  import type { ComputedRef } from 'vue'
  import { DELETING, EDITTING, REPLYING, useState } from '../composables/state'
  import type { IUser } from '../interfaces/IUser'

  const props = defineProps<{
    id: number
    user: IUser
  }>()

  const {
    state,

    isDataLoaded,
    setActive,
    toggleModal,
  } = useState()
  const { currentUser } = toRefs(state)

  const isCurrentUser: ComputedRef<boolean> = computed((): boolean => {
    return isDataLoaded ? props.user.username === currentUser.value.username : false
  })

  const showModal = (): void => {
    setActive(props.id, DELETING)
    toggleModal(true)
  }
</script>

<template>
  <div class="comment-actions">
    <va-card-actions v-if="isCurrentUser">
      <va-button size="small" @click="setActive(props.id, EDITTING)">Editar</va-button>
      <va-button size="small" color="danger" @click="showModal">Apagar</va-button>
    </va-card-actions>
    <va-card-actions v-else>
      <va-button size="small" @click="setActive(props.id, REPLYING)">Responder</va-button>
    </va-card-actions>
  </div>
</template>
