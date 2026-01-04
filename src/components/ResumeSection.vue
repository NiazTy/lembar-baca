<script setup lang="ts">
  import { ref, computed } from "vue"
  import type { Book, ReadingSession } from "../types/book"
  import { useDebouncedPersist } from "../db/useDebouncedPersist"

  const { save, status } = useDebouncedPersist()

  const props = defineProps<{
    book: Book
  }>()

  const sessions = props.book.sessions
  const isFirstSession = computed(() => sessions.length === 0)

  // Form tambah
  const fromPage = ref<number | null>(null)
  const toPage = ref<number | null>(null)
  const summary = ref("")

  // State edit & hapus
  const editingId = ref<string | null>(null)
  const confirmDeleteId = ref<string | null>(null)

  // Timeline
  const timeline = computed(() =>
    [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  )

  // Placeholder adaptif
  const pagePlaceholder = computed(() =>
    fromPage.value && !toPage.value
      ? "Sampai halaman berapa?"
      : "Dari halaman"
  )

  const toPagePlaceholder = computed(() =>
    !fromPage.value ? "Isi halaman awal dulu" : "Sampai halaman"
  )

  const summaryPlaceholder = computed(() => {
    if (!fromPage.value && !toPage.value) {
      return "Apa yang kamu pahami dari bacaan hari ini?"
    }
    if (fromPage.value && toPage.value) {
      return `Ringkasan halaman ${fromPage.value}–${toPage.value}...`
    }
    return "Tuliskan ringkasan bacaan..."
  })

  const addSession = async () => {
    if (!fromPage.value || !toPage.value || !summary.value) return

    const session: ReadingSession = {
      id: crypto.randomUUID(),
      fromPage: fromPage.value,
      toPage: toPage.value,
      summary: summary.value,
      date: new Date().toLocaleDateString()
    }

    sessions.unshift(session)
    save(props.book)

    fromPage.value = null
    toPage.value = null
    summary.value = ""
  }

  const deleteSession = async (id: string) => {
    const idx = sessions.findIndex(s => s.id === id)
    if (idx !== -1) {
      sessions.splice(idx, 1)
      save(props.book)
    }
    confirmDeleteId.value = null
  }

  const saveEditSession = async () => {
    editingId.value = null
    save(props.book)
  }
</script>

<template>
  <section class="space-y-6">
    <!-- MICROCOPY SESI PERTAMA -->
    <div
      v-if="isFirstSession"
      class="p-5 space-y-2 text-center border-2 border-dashed border-border bg-paper/60 fade-slide"
    >
      <p class="text-lg font-typewriter">
        Belum ada sesi bacaan
      </p>
      <p class="max-w-md mx-auto text-sm italic text-accent">
        Setiap pembacaan tidak harus selesai dalam satu waktu.
        Catat halaman yang kamu baca hari ini,
        dan lanjutkan esok tanpa kehilangan jejak.
      </p>
      <p class="text-xs text-border font-typewriter">
        Ini akan menjadi awal timeline bacaanmu.
      </p>
    </div>

    <!-- TAMBAH SESI -->
    <div class="p-4 border-2 border-border bg-paper shadow-vintage">
      <h3 class="mb-2 font-typewriter">Tambah Resume Bacaan</h3>

      <div class="flex gap-2 mb-2">
        <input
          type="number"
          v-model="fromPage"
          :placeholder="pagePlaceholder"
          class="w-24 retro-input"
        />
        <input
          type="number"
          v-model="toPage"
          :placeholder="toPagePlaceholder"
          class="w-32 retro-input"
        />
      </div>

      <textarea
        v-model="summary"
        :placeholder="summaryPlaceholder"
        class="h-24 retro-input font-typewriter"
      />

      <button class="mt-2 retro-button" @click="addSession">
        Simpan Resume
      </button>
    </div>
    <p
      v-if="status !== 'idle'"
      class="mt-1 text-xs italic text-accent"
    >
      <span v-if="status === 'saving'">Menyimpan…</span>
      <span v-else>Tersimpan</span>
    </p>

    <!-- TIMELINE -->
    <div class="relative pl-6">
      <div class="absolute top-0 bottom-0 w-px left-2 bg-border"></div>

      <article
        v-for="s in timeline"
        :key="s.id"
        class="relative p-4 mb-6 border-2 bg-paper border-border shadow-vintage fade-slide"
      >
        <span
          class="absolute w-3 h-3 rounded-full -left-3 top-4 bg-accent"
        ></span>

        <div class="flex items-start justify-between mb-1">
          <p class="text-sm italic text-accent">
            {{ s.date }} — Hal. {{ s.fromPage }}–{{ s.toPage }}
          </p>
          <div class="space-x-2 text-xs">
            <button class="underline" @click="editingId = s.id">
              Edit
            </button>
            <button
              class="text-red-700 underline"
              @click="confirmDeleteId = s.id"
            >
              Hapus
            </button>
          </div>
        </div>

        <div v-if="editingId === s.id" class="space-y-2">
          <div class="flex gap-2">
            <input v-model="s.fromPage" class="w-20 retro-input" />
            <input v-model="s.toPage" class="w-24 retro-input" />
          </div>

          <textarea
            v-model="s.summary"
            class="h-24 retro-input font-typewriter"
          />

          <button class="retro-button" @click="saveEditSession">
            Simpan
          </button>
        </div>

        <p v-else class="text-sm leading-relaxed font-typewriter">
          {{ s.summary }}
        </p>

        <!-- KONFIRMASI HAPUS -->
        <div
          v-if="confirmDeleteId === s.id"
          class="p-2 mt-3 text-sm border border-red-700"
        >
          <p class="mb-2 italic">Hapus resume ini?</p>
          <div class="flex gap-2">
            <button class="retro-button" @click="confirmDeleteId = null">
              Batal
            </button>
            <button
              class="px-3 py-1 text-red-700 transition border-2 border-red-700 hover:bg-red-700 hover:text-paper"
              @click="deleteSession(s.id)"
            >
              Hapus
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
