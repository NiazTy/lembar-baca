export interface ReadingSession {
  id: string
  fromPage: number
  toPage: number
  summary: string
  date: string
}

export interface Book {
  id: string
  title: string
  author: string
  cover?: string
  review: string
  rating: number
  date: string
  sessions: ReadingSession[]
}
