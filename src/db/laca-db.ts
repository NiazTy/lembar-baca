import { openDB } from "idb"
import type { Book } from "../types/book"

export const db = await openDB("laca-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "id" })
    }
  }
})

// CRUD helper
export const bookDB = {
  async getAll(): Promise<Book[]> {
    return await db.getAll("books")
  },

  async add(book: Book) {
    await db.put("books", book)
  },

  async update(book: Book) {
    await db.put("books", book)
  },

  async delete(id: string) {
    await db.delete("books", id)
  },

  async clear() {
    await db.clear("books")
  }
}
