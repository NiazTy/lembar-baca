<script setup lang="ts">
  import { ref, onMounted, watch } from "vue"
  import BookForm from "./components/BookForm.vue"
  import BookCard from "./components/BookCard.vue"
  import BookDetail from "./components/BookDetail.vue"
  import { bookDB } from "./db/laca-db"
  import { migrateFromLocalStorage } from "./db/migrate"
  import type { Book } from "./types/book"

  const books = ref<Book[]>([])
  const activeBook = ref<Book | null>(null)

  onMounted(async () => {
    await migrateFromLocalStorage()
    books.value = await bookDB.getAll()
  })

  const addBook = async (book: Book) => {
    books.value.unshift(book)
    await bookDB.add(book)
  }

  const deleteBook = async (id: string) => {
    books.value = books.value.filter(b => b.id !== id)
    activeBook.value = null
    await bookDB.delete(id)
  }


  const openBook = (book: Book) => {
    activeBook.value = book
  }

  const closeBook = () => {
    activeBook.value = null
  }
</script>

<template>
  <main class="min-h-screen p-6 bg-paper paper-grain">
    <div class="max-w-4xl mx-auto space-y-8">

      <header class="space-y-3 text-center fade-slide">
        <!-- JUDUL -->
        <h1 class="text-5xl tracking-widest font-typewriter">
          LaCa
        </h1>

        <!-- SUBJUDUL -->
        <p class="text-sm italic text-accent">
          Lembar Baca — Arsip Catatan Membaca
        </p>

        <!-- GARIS ARSIP -->
        <div class="flex items-center justify-center gap-3 mt-2">
          <span class="w-12 h-px bg-border"></span>
          <span class="text-xs font-typewriter text-border">
            ARCHIVE
          </span>
          <span class="w-12 h-px bg-border"></span>
        </div>

        <!-- TANGGAL -->
        <p class="text-xs italic text-accent">
          {{ new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          }) }}
        </p>
      </header>

      <!-- FORM -->
      <BookForm @add="addBook" />

      <!-- LIST BUKU -->
      <section v-if="!activeBook" class="grid grid-cols-2 gap-6 md:grid-cols-3">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          @click="openBook(book)"
        />
      </section>
      <!-- DETAIL BUKU -->
      <BookDetail
          v-if="activeBook"
          :book="activeBook"
          @close="closeBook"
          @delete="deleteBook"
      />
      <footer class="pt-16 space-y-2 text-center fade-slide">
        <!-- GARIS -->
        <div class="flex items-center justify-center gap-3">
          <span class="w-16 h-px bg-border"></span>
          <span class="text-xs font-typewriter text-border">
            END OF PAGE
          </span>
          <span class="w-16 h-px bg-border"></span>
        </div>

        <!-- KUTIPAN -->
        <p class="text-sm italic text-accent">
          “Setiap buku adalah jejak waktu yang ditinggalkan.”
        </p>

        <!-- INFO -->
        <p class="text-xs text-border">
          LaCa — Lembar Baca • {{ new Date().getFullYear() }} © <a href="https://niaz.my.id">Niaz</a>
        </p>

      </footer>

    </div>
  </main>
</template>
