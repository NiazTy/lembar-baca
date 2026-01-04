<script setup lang="ts">
  import type { Book } from "../types/book"
  defineProps<{ book: Book }>()
</script>

<template>
  <article class="p-4 border-2 cursor-pointer bg-paper border-border shadow-vintage fade-slide">
    <img
      v-if="book.cover"
      :src="book.cover"
      class="object-cover w-full mb-3 border h-44"
    />
    <div class="flex flex-col gap-2">
      <h3 class="text-lg font-typewriter">{{ book.title }}</h3>
      <div class="flex justify-between">
        <p class="text-sm italic text-accent">{{ book.author }}</p>
        <p class="mt-1 text-sm">★ {{ book.rating }}/5</p>
      </div>
    </div>
  </article>
</template>
