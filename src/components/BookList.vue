<script setup lang="ts">
  import type { Book } from "../types/book"

  defineProps<{
    books: Book[]
  }>()
</script>

<template>
  <section class="space-y-6">
    <article
        v-for="(book, index) in books"
        :key="index"
        class="p-5 border-2 bg-paper border-border shadow-vintage page-flip"
    >
      <h3 class="text-lg font-typewriter type-cursor">
        {{ book.title }}
    </h3>
      <p class="text-sm italic text-accent">
        {{ book.author }}
      </p>

      <p class="mt-1 text-sm">
        ★ {{ book.rating }}/5
      </p>

      <p class="mt-4 text-xs italic text-right text-accent">
        {{ book.date }}
      </p>
    </article>

    <p
      v-if="books.length === 0"
      class="italic text-center text-accent"
    >
      Belum ada lembar yang terisi.
    </p>
  </section>
</template>
