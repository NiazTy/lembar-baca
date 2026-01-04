import { bookDB } from "./laca-db"
import type { Book } from "../types/book"

export async function persistBook(book: Book) {
  await bookDB.update(book)
}
