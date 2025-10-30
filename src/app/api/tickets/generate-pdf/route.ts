import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { html, options = {} } = await request.json()

    if (!html) {
      return NextResponse.json({
        success: false,
        error: 'HTML content is required'
      }, { status: 400 })
    }

    // Pour l'instant, nous allons retourner le HTML comme réponse simplifiée
    // En production, vous pourriez utiliser Puppeteer ou un autre service de génération PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ticket</title>
        <style>
          @page {
            size: ${options.format || 'A4'};
            ${options.orientation === 'landscape' ? 'orientation: landscape;' : ''}
            margin: ${options.border?.top || '20mm'} ${options.border?.right || '20mm'} ${options.border?.bottom || '20mm'} ${options.border?.left || '20mm'};
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `

    // Retourner le HTML comme réponse avec le type MIME approprié
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline; filename="ticket.html"'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}