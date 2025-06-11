import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = process.env.MAILERSEND_API_KEY
  
  if (!apiKey) {
    return NextResponse.json(
      { message: 'MailerSend API key is missing' },
      { status: 500 }
    )
  }
  
  try {
    // Get query parameters
    const url = new URL(req.url)
    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '25'
    const templateId = url.searchParams.get('templateId')
    
    // If templateId is provided, fetch a single template
    if (templateId) {
      const response = await fetch(`https://api.mailersend.com/v1/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return NextResponse.json(data)
    }
    
    // Otherwise, fetch the list of templates
    const response = await fetch(
      `https://api.mailersend.com/v1/templates?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    console.error('Error fetching MailerSend templates:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
