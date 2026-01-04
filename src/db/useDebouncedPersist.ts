import { ref } from "vue"
import type { Book } from "../types/book"
import { persistBook } from "./useBookPersist"

const SAVE_DELAY = 500

export function useDebouncedPersist() {
  const status = ref<"idle" | "saving" | "saved">("idle")
  let timer: number | undefined

  const save = (book: Book) => {
    status.value = "saving"

    if (timer) {
      clearTimeout(timer)
    }

    timer = window.setTimeout(async () => {
      await persistBook(book)
      status.value = "saved"

      // balikin ke idle biar halus
      setTimeout(() => {
        status.value = "idle"
      }, 1200)
    }, SAVE_DELAY)
  }

  return {
    save,
    status
  }
}
