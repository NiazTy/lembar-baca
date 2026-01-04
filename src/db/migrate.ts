import { bookDB } from "./laca-db"
import type { Book } from "../types/book"

export async function migrateFromLocalStorage() {
  const raw = localStorage.getItem("laca-books")
  if (!raw) return

  const books: Book[] = JSON.parse(raw)
  if (!books.length) return

  for (const book of books) {
    await bookDB.add(book)
  }

  localStorage.removeItem("laca-books")
}
