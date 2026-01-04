<script setup lang="ts">
  import { ref, watch } from "vue"
  import type { Book } from "../types/book"
  import ResumeSection from "./ResumeSection.vue"
  import { persistBook } from "../db/useBookPersist"
  import { useDebouncedPersist } from "../db/useDebouncedPersist"
  import { exportBookPdf } from "../utils/exportBookPdf"

  const { save, status } = useDebouncedPersist()

  const props = defineProps<{ book: Book }>()
  const emit = defineEmits<{
    (e: "close"): void
    (e: "delete", id: string): void
  }>()

  const showConfirm = ref(false)
  const editing = ref(false)
  const tab = ref<"review" | "summary">("review")

  const confirmDelete = () => {
    showConfirm.value = false
    emit("delete", props.book.id)
  }

  const review = ref(props.book.review)
  const title = ref(props.book.title)
  const author = ref(props.book.author)

  const saveMeta = async () => {
    props.book.title = title.value
    props.book.author = author.value
    editing.value = false

    await persistBook(props.book)
  }

  watch(review, (v) => {
    props.book.review = v
    save(props.book)
  })
</script>

<template>
  <section class="p-6 border-2 bg-paper border-border shadow-vintage fade-slide">
    <!-- HEADER ATAS -->
    <div class="flex justify-between mb-4">
      <button class="retro-button" @click="emit('close')">
        ← Kembali
      </button>
      <div class="space-x-5">
        <button class="retro-button" @click="exportBookPdf(book)">
          Export PDF
        </button>
        <button
          class="px-4 py-2 text-red-700 transition border-2 border-red-700 hover:cursor-pointer hover:bg-red-700 hover:text-paper"
          @click="showConfirm = true"
        >
          Hapus
        </button>
      </div>
    </div>
    <!-- TAB + HEADER BUKU -->
    <div class="flex justify-between gap-4 mb-4">
      <div class="space-x-4">
        <button @click="tab='review'" class="retro-button">Reviu</button>
        <button @click="tab='summary'" class="retro-button">Resume</button>
      </div>
      <!-- HEADER BUKU -->
      <div class="mb-4">
        <div v-if="!editing">
          <h2 class="text-xl font-typewriter">
            {{ book.title }}
          </h2>
          <p class="text-sm italic text-accent">
            {{ book.author }}
          </p>

          <button
            class="mt-1 retro-button"
            @click="editing = true"
          >
            Edit
          </button>
        </div>
        <div v-else class="space-y-2">
          <input
            v-model="title"
            class="retro-input font-typewriter"
            placeholder="Judul buku"
          />
          <input
            v-model="author"
            class="retro-input font-typewriter"
            placeholder="Penulis"
          />
          <button
            class="retro-button"
            @click="saveMeta"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
    <!-- REVIEW -->
    <textarea
      v-if="tab === 'review'"
      v-model="review"
      class="h-40 retro-input font-typewriter"
      placeholder="Reviu pribadi..."
    />
    <p
      v-if="status !== 'idle'"
      class="mt-1 text-xs italic text-accent"
    >
      <span v-if="status === 'saving'">Menyimpan…</span>
      <span v-else>Tersimpan</span>
    </p>


    <!-- RESUME -->
    <ResumeSection
      v-if="tab === 'summary'"
      :sessions="book.sessions"
      :book="book"
    />
  </section>

  <!-- MODAL KONFIRMASI HAPUS -->
  <div
    v-if="showConfirm"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div
      class="p-6 border-2 bg-paper border-border shadow-vintage w-80 fade-slide"
    >
      <h3 class="mb-2 text-lg font-typewriter">
        Hapus Buku?
      </h3>

      <p class="mb-4 text-sm italic">
        Catatan dan resume akan ikut terhapus.
      </p>

      <div class="flex justify-end gap-3">
        <button
          class="retro-button"
          @click="showConfirm = false"
        >
          Batal
        </button>

        <button
          class="px-3 py-1 text-red-700 transition border-2 border-red-700 hover:bg-red-700 hover:text-paper"
          @click=confirmDelete
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>
