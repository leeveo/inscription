import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'

const MAILERSEND_API_KEY = Deno.env.get('MAILERSEND_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('MAILERSEND_FROM_EMAIL') || ''
const FROM_NAME = Deno.env.get('MAILERSEND_FROM_NAME') || 'Event Admin'

interface EmailPayload {
  to: string
  subject: string
  html: string
  eventId?: string
  participantId?: number
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
  
  try {
    const { to, subject, html } = await req.json() as EmailPayload
    
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        to: [
          {
            email: to
          }
        ],
        subject: subject,
        html: html
      })
    });
    
    const result = await response.text();
    
    return new Response(
      JSON.stringify({ 
        success: response.ok,
        status: response.status,
        result: result
      }),
      { 
        status: response.ok ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
