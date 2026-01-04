import jsPDF from "jspdf"
import type { Book } from "../types/book"

function drawHeaderFooter(
    doc: jsPDF,
    bookTitle: string,
    pageNo: number,
    totalPages?: number
) {
    doc.setFontSize(9)
    doc.setTextColor(120)

    doc.text(bookTitle, 20, 10)
    doc.text("LaCa — Lembar Baca", 190, 10, { align: "right" })

    const date = new Date().toLocaleDateString("id-ID")
    doc.text(date, 20, 290)
    const pageText = pageNo + (totalPages ? ` / ${totalPages}` : "")
    doc.text(pageText, 190, 290, { align: "right" })
}

function drawMultilineText(
  doc: jsPDF,
  lines: string[],
  x: number,
  startY: number,
  lineHeight = 6,
  bottomLimit = 270,
  onNewPage?: () => void
) {
  let y = startY

  for (const line of lines) {
    if (y > bottomLimit) {
      doc.addPage()
      onNewPage?.()
      y = 30
    }

    doc.text(line, x, y)
    y += lineHeight
  }

  return y
}

function drawWatermark(doc: jsPDF) {
    doc.setFontSize(40)
    doc.setTextColor(200)

    doc.text(
        "LaCa — Lembar Baca",
        105,
        150,
        {
            angle: 45,
            align: "center"
        }
    )
}

export function exportBookPdf(book: Book) {
    const doc = new jsPDF()
    let y = 30
    let pageNo = 1

    drawHeaderFooter(doc, book.title, pageNo)
    drawWatermark(doc)

    if (book.cover) {
        const isPng = book.cover.startsWith("data:image/png")
        const format = isPng ? "PNG" : "JPEG"

        const coverWidth = 60
        const coverHeight = 90
        const x = (210 - coverWidth) / 2

        doc.addImage(book.cover, format, x, y, coverWidth, coverHeight)
        y += coverHeight + 10
    }

    doc.setTextColor(0)
    doc.setFontSize(18)
    doc.text(book.title, 105, y, { align: "center" })
    y += 8

    doc.setFontSize(11)
    doc.text(`Penulis: ${book.author}`, 105, y, { align: "center" })
    y += 6

    doc.setFontSize(10)
    doc.text(
        `Rating: ${book.rating}/5 • Ditambahkan: ${book.date}`,
        105,
        y,
        { align: "center" }
    )
    y += 10

    doc.line(20, y, 190, y)
    y += 8

    doc.setFontSize(13)
    doc.text("Reviu Akhir", 20, y)
    y += 6

    doc.setFontSize(11)
    const reviewLines = doc.splitTextToSize(book.review || "—", 170)
    y = drawMultilineText(
        doc,
        reviewLines,
        20,
        y,
        6,
        270,
        () => {
            drawHeaderFooter(doc, book.title, doc.getCurrentPageInfo().pageNumber)
            drawWatermark(doc)
        }
    )

    y += 8


    doc.setFontSize(13)
    doc.text("Timeline Bacaan", 20, y)
    y += 8

    doc.setFontSize(11)

    for (const s of book.sessions) {
        if (y > 250) {
            doc.addPage()
            pageNo++
            y = 30
            drawHeaderFooter(doc, book.title, pageNo)
            drawWatermark(doc)
        }

        const header = `${s.date} — Hal. ${s.fromPage}–${s.toPage}`
        doc.text(header, 20, y)
        y += 5

        const summaryLines = doc.splitTextToSize(s.summary, 160)

        y = drawMultilineText(
            doc,
            summaryLines,
            25,
            y,
            6,
            270,
            () => {
                drawHeaderFooter(doc, book.title, doc.getCurrentPageInfo().pageNumber)
                drawWatermark(doc)
            }
        )
        y += 6
    }

    const totalPages = doc.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        drawHeaderFooter(doc, book.title, i, totalPages)
    }

    const safeTitle = book.title.replace(/[^\w\d]+/g, "_")
    doc.save(`${safeTitle}.pdf`)
}
