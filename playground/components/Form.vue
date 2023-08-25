<script setup lang="ts">
import { ref } from '#imports'
import { addTodo } from '~/lib/todo.server'

const title = ref('')
const content = ref('')
const submitting = ref(false)

const emit = defineEmits(['create'])

async function handleSubmit () {
  submitting.value = true
  const todo = await addTodo({
    title: title.value,
    content: content.value
  })
  console.log('added todo: ', todo)
  submitting.value = false
  title.value = ''
  content.value = ''
  emit('create')
}
</script>

<template>
  <div>
    <h1>Add todo</h1>
    <form @submit.prevent="handleSubmit">
      <input
        v-model="title"
        placeholder="Title"
        type="text"
      > <br>
      <input
        v-model="content"
        placeholder="Content"
        type="text"
      > <br>
      <button
        type="submit"
        :disabled="submitting"
      >
        Submit
      </button>
    </form>
  </div>
</template>
