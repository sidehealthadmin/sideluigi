import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib'

interface PDFOptions {
  caseId: string
  letterText: string
  patientName: string
  insurerName: string
  medication: string
  denialDate: string
}

const LINE_HEIGHT = 16
const FONT_SIZE = 11
const MARGIN_LEFT = 72  // 1 inch
const MARGIN_RIGHT = 72
const MARGIN_TOP = 72
const MARGIN_BOTTOM = 72
const PAGE_WIDTH = 612   // US Letter
const PAGE_HEIGHT = 792

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

/**
 * Generate a PDF in memory and return the bytes as a base64 string.
 * No filesystem writes — compatible with Vercel's read-only serverless environment.
 */
export async function generatePDF(options: PDFOptions): Promise<string> {
  const { caseId, letterText, patientName, insurerName, medication, denialDate } = options

  const pdfDoc = await PDFDocument.create()
  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  const usableWidth = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN_TOP

  const addPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    y = PAGE_HEIGHT - MARGIN_TOP
    // Footer on new page
    addFooter(page, pdfDoc.getPageCount())
  }

  const addFooter = (p: PDFPage, pageNum: number) => {
    p.drawText(`${patientName} — Appeal re: ${medication} — Page ${pageNum}`, {
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM / 2,
      size: 9,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    })
  }

  // Add footer to first page
  addFooter(page, 1)

  const drawText = (
    text: string,
    fontToUse = regularFont,
    size = FONT_SIZE,
    color = rgb(0, 0, 0)
  ) => {
    const lines = wrapText(text, fontToUse, size, usableWidth)
    for (const line of lines) {
      if (y < MARGIN_BOTTOM + LINE_HEIGHT) {
        addPage()
      }
      page.drawText(line, {
        x: MARGIN_LEFT,
        y,
        size,
        font: fontToUse,
        color,
      })
      y -= LINE_HEIGHT
    }
  }

  const addSpacing = (lines = 1) => {
    y -= LINE_HEIGHT * lines
  }

  // ---- Header bar ----
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 36,
    width: PAGE_WIDTH,
    height: 36,
    color: rgb(0.04, 0.4, 0.78),
  })
  page.drawText('INSURANCE APPEAL LETTER', {
    x: MARGIN_LEFT,
    y: PAGE_HEIGHT - 24,
    size: 13,
    font: boldFont,
    color: rgb(1, 1, 1),
  })
  page.drawText(`Generated: ${new Date().toLocaleDateString('en-US')}`, {
    x: PAGE_WIDTH - MARGIN_RIGHT - 130,
    y: PAGE_HEIGHT - 24,
    size: 10,
    font: regularFont,
    color: rgb(0.9, 0.9, 0.9),
  })

  y = PAGE_HEIGHT - MARGIN_TOP - 10

  // ---- Letter body ----
  const paragraphs = letterText.split(/\n\n+/)

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue

    const isHeaderLine = paragraph.trim().length < 80 && !paragraph.includes('.')

    if (isHeaderLine) {
      const lines = paragraph.split('\n')
      for (const line of lines) {
        if (line.trim()) {
          drawText(line.trim(), regularFont, FONT_SIZE)
        }
      }
      addSpacing(0.5)
    } else {
      drawText(paragraph.trim(), regularFont, FONT_SIZE)
      addSpacing(1)
    }
  }

  // ---- Return as base64 (no disk writes) ----
  const pdfBytes = await pdfDoc.save()
  const base64 = Buffer.from(pdfBytes).toString('base64')
  return base64
}
