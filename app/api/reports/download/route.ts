// app/api/reports/download/route.ts
//
// ONE JOB: handle GET /api/reports/download
//
// Queries all active products -> formats them into a PDF table ->
// streams the PDF file back to the browser as a download.

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

type ProductReportRow = {
  name: string
  current_stock: number
  price: number
  categories:
    | {
        main_type: string | null
        sub_category_name: string | null
      }
    | {
        main_type: string | null
        sub_category_name: string | null
      }[]
    | null
}

function formatCategory(product: ProductReportRow) {
  if (!product.categories) return '-'

  const category = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories

  if (!category) return '-'

  return [category.main_type, category.sub_category_name].filter(Boolean).join(' / ')
}

function formatPrice(price: number) {
  return `Rs. ${Number(price).toFixed(2)}`
}

function fitCell(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 3)}...`
}

async function buildPdf(products: ProductReportRow[]) {
  const pdf = await PDFDocument.create()
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

  const pageWidth = 612
  const pageHeight = 792
  const margin = 48
  const rowHeight = 22
  const tableTop = 690
  const tableBottom = 64

  const columns = [
    { title: 'Product', x: margin, width: 180 },
    { title: 'Category', x: 230, width: 170 },
    { title: 'Stock', x: 415, width: 54 },
    { title: 'Price', x: 480, width: 84 },
  ]

  function addPage(pageNumber: number) {
    const page = pdf.addPage([pageWidth, pageHeight])

    page.drawText('Ledger Inventory Report', {
      x: margin,
      y: 744,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    page.drawText(
      `Generated: ${new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`,
      {
        x: margin,
        y: 722,
        size: 9,
        font: regularFont,
        color: rgb(0.35, 0.35, 0.35),
      }
    )

    page.drawText(`Page ${pageNumber}`, {
      x: 520,
      y: 722,
      size: 9,
      font: regularFont,
      color: rgb(0.35, 0.35, 0.35),
    })

    page.drawRectangle({
      x: margin - 4,
      y: tableTop - 6,
      width: pageWidth - margin * 2 + 8,
      height: 20,
      color: rgb(0.9, 0.93, 0.96),
    })

    for (const column of columns) {
      page.drawText(column.title, {
        x: column.x,
        y: tableTop,
        size: 10,
        font: boldFont,
        color: rgb(0.12, 0.12, 0.12),
      })
    }

    return page
  }

  let pageNumber = 1
  let page = addPage(pageNumber)
  let y = tableTop - 28

  for (const product of products) {
    if (y < tableBottom) {
      pageNumber += 1
      page = addPage(pageNumber)
      y = tableTop - 28
    }

    const cells = [
      fitCell(product.name, 30),
      fitCell(formatCategory(product), 28),
      String(product.current_stock),
      formatPrice(product.price),
    ]

    for (const [index, cell] of cells.entries()) {
      page.drawText(cell, {
        x: columns[index].x,
        y,
        size: 9,
        font: regularFont,
        color: rgb(0.08, 0.08, 0.08),
      })
    }

    page.drawLine({
      start: { x: margin - 4, y: y - 7 },
      end: { x: pageWidth - margin + 4, y: y - 7 },
      thickness: 0.4,
      color: rgb(0.86, 0.86, 0.86),
    })

    y -= rowHeight
  }

  if (products.length === 0) {
    page.drawText('No active products found.', {
      x: margin,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0.2, 0.2, 0.2),
    })
  }

  return await pdf.save()
}

export async function GET() {
  const { data: products, error } = await supabase
    .from('products')
    .select('name, current_stock, price, categories(main_type, sub_category_name)')
    .eq('is_active', true)
    .order('name')

  if (error) {
    return Response.json(
      { error: 'Could not fetch active products for the report.' },
      { status: 500 }
    )
  }

  const pdf = Buffer.from(await buildPdf((products ?? []) as ProductReportRow[]))

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="inventory-report.pdf"',
    },
  })
}
