import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = process.env.BREVO_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { message: 'Brevo API key is missing' },
      { status: 500 }
    )
  }
  
  try {
    console.log('Fetching Brevo templates...')
    
    // Get query parameters
    const url = new URL(req.url)
    const templateId = url.searchParams.get('templateId')
    
    // If templateId is provided, fetch a single template
    if (templateId) {
      const response = await fetch(`https://api.brevo.com/v3/smtp/templates/${templateId}`, {
        headers: {
          'api-key': apiKey,
          'accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        console.error(`Brevo API error for template ${templateId}: ${response.status}`)
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Single Brevo template fetched:', data.name)
      return NextResponse.json(data)
    }
    
    // Otherwise, fetch the list of templates
    const response = await fetch('https://api.brevo.com/v3/smtp/templates', {
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.error(`Brevo API error: ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Fetched ${data.templates?.length || 0} Brevo templates`)
    
    // Return the templates in the expected format
    return NextResponse.json({
      templates: data.templates || [],
      count: data.count || 0
    })
    
  } catch (error: Error | unknown) {
    console.error('Failed to fetch Brevo templates:', error)
    return NextResponse.json(
      { 
        message: 'Failed to fetch templates',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        templates: [] // Return empty array to prevent UI errors
      },
      { status: 500 }
    )
  }
}
