// app/api/reports/download/route.ts
//
// ONE JOB: handle GET /api/reports/download
//
// Queries all active products → formats into PDF via jsPDF →
// streams the PDF file back to the browser as a download.
//
// (Phase 3 implementation goes here)
export async function GET() {
  return Response.json({ message: 'PDF report route — Phase 3' }, { status: 501 })
}
