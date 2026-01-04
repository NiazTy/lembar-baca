import { bookDB } from './laca-db'
import type { Book } from '../types/book'
import { toRaw } from 'vue'

export async function persistBook(book: Book) {
  const raw = toRaw(book)
  const cleanBook = structuredClone(raw)

  await bookDB.update(cleanBook)
}
