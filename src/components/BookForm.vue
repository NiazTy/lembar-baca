<script setup lang="ts">
import { ref, computed } from "vue"
import type { Book } from "../types/book"

const emit = defineEmits<{
  (e: "add", book: Book): void
}>()

const title = ref("")
const author = ref("")
const rating = ref(5)
const review = ref("")

const cover = ref<string | undefined>(undefined)

const microcopy = computed(() => {
  if (!title.value && !author.value && !cover.value) {
    return {
      title: "Arsip ini masih kosong",
      body: "Setiap buku dimulai dari satu niat membaca. Mulailah dengan judul."
    }
  }

  if (title.value && !author.value) {
    return {
      title: "Judul sudah tercatat",
      body: "Siapa penulisnya? Jika lupa, bisa diisi nanti."
    }
  }

  if (title.value && author.value && !cover.value) {
    return {
      title: "Buku mulai terbentuk",
      body: "Sampul membantu mengingat, tapi tidak wajib."
    }
  }

  if (title.value && author.value && cover.value) {
    return {
      title: "Siap menjadi bagian arsip",
      body: "Tambahkan catatan awal, atau langsung simpan."
    }
  }

  return {
    title: "",
    body: ""
  }
})

const handleCoverUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    cover.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

const submit = () => {
  if (!title.value.trim() || !author.value.trim()) return

  const book: Book = {
    id: crypto.randomUUID(),
    title: title.value,
    author: author.value,
    cover: cover.value,
    review: review.value,
    rating: rating.value,
    date: new Date().toLocaleDateString(),
    sessions: []
  }

  emit("add", book)

  title.value = ""
  author.value = ""
  rating.value = 5
  review.value = ""
  cover.value = undefined
}
</script>

<template>
  <form
    @submit.prevent="submit"
    class="p-6 space-y-6 border-2 bg-paper border-border shadow-vintage fade-slide"
  >
    <!-- JUDUL FORM -->
    <h2 class="pb-2 text-xl border-b font-typewriter border-border">
      Tambah Buku Baru
    </h2>
    <!-- EMPTY STATE -->
    <!-- MICROCOPY DINAMIS -->
    <div
      class="p-6 space-y-2 text-center border-2 border-dashed border-border bg-paper/60 fade-slide"
    >
      <p class="text-lg font-typewriter" :key="microcopy.title">
        {{ microcopy.title }}
      </p>

      <p class="max-w-md mx-auto text-sm italic text-accent" :key="microcopy.title">
        {{ microcopy.body }}
      </p>
    </div>

    <!-- GRID UTAMA -->
    <div class="grid gap-6 md:grid-cols-2">

      <!-- COVER -->
      <div class="space-y-3">
        <label class="text-sm italic text-accent">
          Sampul Buku
        </label>

        <div
          class="p-4 text-center transition border-2 border-dashed cursor-pointer border-border hover:bg-border/20"
        >
          <input
            type="file"
            accept="image/*"
            class="hidden"
            id="cover-upload"
            @change="handleCoverUpload"
          />
          <label for="cover-upload" class="cursor-pointer">
            <p v-if="!cover" class="text-sm italic">
              Klik untuk mengunggah cover
            </p>
            <img
              v-else
              :src="cover"
              class="object-cover h-48 mx-auto border shadow-vintage"
            />
          </label>
        </div>
      </div>

      <!-- INFO BUKU -->
      <div class="space-y-4">
        <div>
          <label class="text-sm italic text-accent">Judul Buku</label>
          <input
            v-model="title"
            placeholder="Judul buku"
            class="retro-input font-typewriter"
          />
        </div>

        <div>
          <label class="text-sm italic text-accent">Penulis</label>
          <input
            v-model="author"
            placeholder="Nama penulis"
            class="retro-input font-typewriter"
          />
        </div>

        <div>
          <label class="text-sm italic text-accent">Rating Awal</label>
          <div class="flex items-center gap-3 text-sm">
            <input type="range" min="1" max="5" v-model="rating" />
            <span>{{ rating }}/5</span>
          </div>
        </div>
      </div>
    </div>
    <!-- REVIEW AWAL -->
    <div>
      <label class="text-sm italic text-accent">
        Catatan Awal (opsional)
      </label>
      <textarea
        v-model="review"
        placeholder="Kesan awal atau ringkasannya..."
        class="retro-input h-28 font-typewriter"
      />
    </div>
    <!-- ACTION -->
    <div class="flex justify-end">
      <button class="retro-button">
        Simpan Buku
      </button>
    </div>
  </form>
</template>
