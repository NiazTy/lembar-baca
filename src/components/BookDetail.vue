<script setup lang="ts">
  import { ref, watch, computed } from "vue"
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

  const review = ref(props.book.review)
  const title = ref(props.book.title)
  const author = ref(props.book.author)

  const touchStartX = ref(0)
  const touchStartY = ref(0)

  const swipeEnabled = computed(() => !editing.value)

  const onTouchStart = (e: TouchEvent) => {
    if (!swipeEnabled.value) return
    const t = e.touches[0]
    if (!t) return
    touchStartX.value = t.clientX
    touchStartY.value = t.clientY
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (!swipeEnabled.value) return
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - touchStartX.value
    const dy = t.clientY - touchStartY.value

    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return

    if (dx < 0 && tab.value === "review") {
      tab.value = "summary"
    } else if (dx > 0 && tab.value === "summary") {
      tab.value = "review"
    }
  }

  const confirmDelete = () => {
    showConfirm.value = false
    emit("delete", props.book.id)
  }

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
  <section
    class="max-w-3xl p-4 mx-auto border-2 sm:p-6 bg-paper border-border shadow-vintage fade-slide"
  >
    <div class="flex items-center justify-between gap-3 mb-4">
      <button class="retro-button" @click="emit('close')">
        ← Kembali
      </button>

      <div class="flex gap-2">
        <button
          class="hidden retro-button sm:inline-block"
          @click="exportBookPdf(book)"
        >
          Export PDF
        </button>
        <button
          class="px-3 py-2 text-red-700 transition border-2 border-red-700 hover:bg-red-700 hover:text-paper"
          @click="showConfirm = true"
        >
          Hapus
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4 mb-4 sm:flex-row">
      <img
        v-if="book.cover"
        :src="book.cover"
        class="w-24 border-2 sm:w-28 border-border shadow-vintage"
      />

      <div class="flex-1">
        <div v-if="!editing">
          <h2 class="text-xl sm:text-2xl font-typewriter">
            {{ book.title }}
          </h2>
          <p class="text-sm italic text-accent">
            {{ book.author }}
          </p>
          <p class="text-xs text-border">
            {{ book.date }} • Rating {{ book.rating }}/5
          </p>

          <button class="mt-2 retro-button" @click="editing = true">
            Edit Info Buku
          </button>
        </div>

        <div v-else class="space-y-2">
          <input v-model="title" class="retro-input" placeholder="Judul buku" />
          <input v-model="author" class="retro-input" placeholder="Penulis" />
          <button class="retro-button" @click="saveMeta">Simpan</button>
        </div>
      </div>
    </div>

    <div class="flex gap-2 mb-2">
      <button
        class="flex-1 retro-button"
        :class="{ 'opacity-60': tab !== 'review' }"
        @click="tab = 'review'"
      >
        Reviu
      </button>
      <button
        class="flex-1 retro-button"
        :class="{ 'opacity-60': tab !== 'summary' }"
        @click="tab = 'summary'"
      >
        Resume
      </button>
    </div>

    <div class="flex justify-center gap-2 mb-3 sm:hidden">
      <span
        class="w-2 h-2 rounded-full"
        :class="tab === 'review' ? 'bg-accent' : 'bg-border'"
      />
      <span
        class="w-2 h-2 rounded-full"
        :class="tab === 'summary' ? 'bg-accent' : 'bg-border'"
      />
    </div>

    <div
      class="relative overflow-hidden"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <transition name="slide" mode="out-in">
        <div v-if="tab === 'review'" key="review">
          <textarea
            v-model="review"
            class="w-full h-40 retro-input font-typewriter"
            placeholder="Reviu pribadi setelah membaca buku ini..."
          />
          <p v-if="status !== 'idle'" class="mt-1 text-xs italic text-accent">
            <span v-if="status === 'saving'">Menyimpan…</span>
            <span v-else>Tersimpan</span>
          </p>
        </div>

        <div v-else key="summary">
          <ResumeSection :book="book" :sessions="book.sessions" />
        </div>
      </transition>
    </div>

    <p
      v-if="swipeEnabled"
      class="mt-2 text-xs italic text-center text-border sm:hidden"
    >
      Geser kiri / kanan untuk berpindah tab
    </p>
  </section>

  <div
    v-if="showConfirm"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div
      class="p-6 border-2 w-80 bg-paper border-border shadow-vintage fade-slide"
    >
      <h3 class="mb-2 text-lg font-typewriter">Hapus Buku?</h3>
      <p class="mb-4 text-sm italic">
        Semua catatan dan resume akan ikut terhapus.
      </p>

      <div class="flex justify-end gap-3">
        <button class="retro-button" @click="showConfirm = false">
          Batal
        </button>
        <button
          class="px-3 py-1 text-red-700 transition border-2 border-red-700 hover:bg-red-700 hover:text-paper"
          @click="confirmDelete"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>
