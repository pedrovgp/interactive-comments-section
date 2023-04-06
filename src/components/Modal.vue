<script setup lang="ts">
  import { onMounted, ref, toRefs, watchEffect } from 'vue'
  import type { Ref } from 'vue'
  import { useState } from '../composables/state'

  const { state, deleteComment, toggleModal, setActive } = useState()
  const { activeId, isModalActive: isActive } = toRefs(state)

  const modal: Ref<HTMLDialogElement | null> = ref(null)

  onMounted((): void => {
    watchEffect((): void => {
      isActive.value ? modal.value!.showModal() : modal.value!.close()
    })
  })

  const close = (): void => {
    setActive(null, null)
    toggleModal(false)
  }

  const cancel = (): void => {
    close()
  }

  const remove = (): void => {
    if (activeId.value !== null) deleteComment(activeId.value)
    close()
  }
</script>

<template>
  <dialog class="modal" id="modal" ref="modal">
    <va-card>
      <va-card-title>Delete comment</va-card-title>
      <va-card-content
        ><p>
          Are you sure your want to delete this comment? This will remove the comment and can't be undone.
        </p></va-card-content
      >
      <va-card-actions>
        <va-button color="warning" @click="cancel">Não, cancelar</va-button>
        <va-button color="danger" @click="remove">Sim, apagar</va-button>
      </va-card-actions>
    </va-card>
  </dialog>
</template>
