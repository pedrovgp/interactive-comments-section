<script setup lang="ts">
  import AddComment from './components/AddComment.vue'
  import Modal from './components/Modal.vue'
  import CommentList from './components/CommentList.vue'
  import { useState } from './composables/state'

  const { isDataLoaded, loadData } = useState()
  loadData()
</script>

<template>
  <header class="visually-hidden">
    <h1>Interactive Comments Section</h1>
  </header>
  <main>
    <CommentList />
    <AddComment v-if="isDataLoaded" button-text="Enviar" />
    <Modal />
  </main>
</template>

<style>
  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .comment-list .comment-list {
    background: linear-gradient(var(--color-light-gray), var(--color-light-gray)) no-repeat 0 / 2px 100%;
    margin: 1.5rem auto 0;
    padding-left: 1rem;
  }

  @media screen and (min-width: 770px) {
    .comment-list .comment-list {
      background-position: 2.5rem;
      padding-left: 5.25rem;
    }
  }
</style>
