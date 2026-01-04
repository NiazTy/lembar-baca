import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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

// function drawWatermark(doc: jsPDF) {
//     doc.setFontSize(40)
//     doc.setTextColor(200)

//     doc.text(
//         "LaCa — Lembar Baca",
//         105,
//         150,
//         {
//             angle: 45,
//             align: "center"
//         }
//     )
// }

export function exportBookPdf(book: Book) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    })
    
    let y = 30

    drawHeaderFooter(doc, book.title, 1)
    // drawWatermark(doc)

    // Cover image
    if (book.cover) {
        try {
            const isPng = book.cover.startsWith("data:image/png")
            const format = isPng ? "PNG" : "JPEG"

            const coverWidth = 60
            const coverHeight = 90
            const x = (210 - coverWidth) / 2

            doc.addImage(book.cover, format, x, y, coverWidth, coverHeight)
            y += coverHeight + 10
        } catch (e) {
            console.error("Error adding cover image:", e)
        }
    }

    // Judul buku
    doc.setTextColor(0)
    doc.setFontSize(18)
    doc.setFont("helvetica", 'bold')
    doc.text(book.title, 105, y, { align: "center", maxWidth: 170 })
    y += 10

    // Penulis
    doc.setFontSize(11)
    doc.setFont("helvetica", 'normal')
    doc.text(`Penulis: ${book.author}`, 105, y, { align: "center" })
    y += 6

    // Rating dan tanggal
    doc.setFontSize(10)
    doc.text(
        `Rating: ${book.rating}/5 • Ditambahkan: ${book.date}`,
        105,
        y,
        { align: "center" }
    )
    y += 10

    // Separator
    doc.setDrawColor(200)
    doc.line(20, y, 190, y)
    y += 10

    // Section: Reviu Akhir
    doc.setFontSize(13)
    doc.setFont("helvetica", 'bold')
    doc.setTextColor(0)
    doc.text("Reviu Akhir", 20, y)
    y += 8

    // Review content menggunakan autoTable
    autoTable(doc, {
        startY: y,
        head: [],
        body: [[book.review || "—"]],
        theme: 'plain',
        styles: {
            fontSize: 11,
            cellPadding: 0,
            textColor: [0, 0, 0],
            font: 'helvetica',
            fontStyle: 'normal',
            lineColor: [255, 255, 255],
            lineWidth: 0
        },
        columnStyles: {
            0: { cellWidth: 170 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: function(data) {
            const pageNum = doc.getCurrentPageInfo().pageNumber
            if (pageNum > 1) {
                drawHeaderFooter(doc, book.title, pageNum)
                // drawWatermark(doc)
            }
        }
    })

    // Get position setelah review
    y = (doc as any).lastAutoTable.finalY + 15

    // Cek apakah perlu halaman baru untuk Timeline
    if (y > 260) {
        doc.addPage()
        y = 30
        drawHeaderFooter(doc, book.title, doc.getCurrentPageInfo().pageNumber)
        // drawWatermark(doc)
    }

    // Section: Timeline Bacaan
    doc.setFontSize(13)
    doc.setFont("helvetica", 'bold')
    doc.text("Timeline Bacaan", 20, y)
    y += 8

    // Timeline sessions menggunakan autoTable
    const sessionRows = book.sessions.map(s => {
        const header = `${s.date} — Hal. ${s.fromPage}–${s.toPage}`
        return [header, s.summary]
    })

    if (sessionRows.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [],
            body: sessionRows,
            theme: 'plain',
            styles: {
                fontSize: 11,
                cellPadding: { top: 2, bottom: 5, left: 0, right: 0 },
                textColor: [0, 0, 0],
                font: 'helvetica',
                lineColor: [255, 255, 255],
                lineWidth: 0,
                minCellHeight: 8
            },
            columnStyles: {
                0: { 
                    cellWidth: 170,
                    fontStyle: 'bold',
                    fontSize: 11
                },
                1: { 
                    cellWidth: 165,
                    fontStyle: 'normal',
                    fontSize: 11
                }
            },
            margin: { left: 20, right: 20 },
            didDrawCell: function(data) {
                // Indentasi untuk summary (kolom 1)
                if (data.column.index === 1) {
                    data.cell.x = 25
                    data.cell.width = 165
                }
            },
            didDrawPage: function(data) {
                const pageNum = doc.getCurrentPageInfo().pageNumber
                if (pageNum > 1) {
                    drawHeaderFooter(doc, book.title, pageNum)
                    // drawWatermark(doc)
                }
            }
        })
    }

    // Update semua halaman dengan total pages
    const totalPages = doc.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        drawHeaderFooter(doc, book.title, i, totalPages)
    }

    // Save dengan nama file yang aman
    const safeTitle = book.title
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
    
    doc.save(`${safeTitle}.pdf`)
}