// Supabase Edge Function for sending emails via Resend
// This runs server-side, so API keys are secure
// Enhanced with detailed logging for better debugging

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

// Helper function for formatted logging
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [SEND-EMAIL] [${level}]`
  
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2))
  } else {
    console.log(`${prefix} ${message}`)
  }
}

interface EmailRequest {
  to: string | string[]
  from?: string
  subject: string
  html: string
  replyTo?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    log('INFO', '📨 Email request received')
    
    // Verify request method
    if (req.method !== 'POST') {
      log('WARN', 'Invalid HTTP method', { method: req.method })
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // STEP 1: Verify API Key Configuration
    // ============================================
    log('INFO', '🔐 Checking RESEND_API_KEY configuration')
    
    if (!RESEND_API_KEY) {
      log('ERROR', '🔴 RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          message: 'Please set RESEND_API_KEY in Supabase Edge Function Secrets',
          help: 'Visit Supabase Dashboard → Settings → Edge Function Secrets → Add RESEND_API_KEY'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    const keyFormat = RESEND_API_KEY.startsWith('re_') ? '✅' : '⚠️'
    const keyLength = RESEND_API_KEY.length
    log('INFO', `${keyFormat} API Key found: ${keyLength} characters`)

    // ============================================
    // STEP 2: Parse and Validate Request
    // ============================================
    log('INFO', '📝 Parsing email request body')
    
    let emailRequest: EmailRequest
    try {
      emailRequest = await req.json()
    } catch (parseError) {
      log('ERROR', 'Failed to parse JSON request body', { error: String(parseError) })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Validate required fields
    const missingFields = []
    if (!emailRequest.to) missingFields.push('to')
    if (!emailRequest.subject) missingFields.push('subject')
    if (!emailRequest.html) missingFields.push('html')
    
    if (missingFields.length > 0) {
      log('WARN', 'Missing required fields', { missingFields })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          message: `Required fields missing: ${missingFields.join(', ')}`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    log('INFO', '✅ Email request validated', {
      to: Array.isArray(emailRequest.to) ? `${emailRequest.to.length} recipients` : emailRequest.to,
      subject: emailRequest.subject.substring(0, 50) + '...',
      from: emailRequest.from || 'Basic Intelligence <onboarding@resend.dev>'
    })

    // ============================================
    // STEP 3: Send Email via Resend API
    // ============================================
    log('INFO', '🚀 Sending email via Resend API')
    
    const startTime = Date.now()
    let resendResponse
    
    try {
      resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: emailRequest.from || 'Basic Intelligence <onboarding@resend.dev>',
          to: Array.isArray(emailRequest.to) ? emailRequest.to : [emailRequest.to],
          subject: emailRequest.subject,
          html: emailRequest.html,
          ...(emailRequest.replyTo && { reply_to: emailRequest.replyTo }),
        }),
      })
      
      const responseTime = Date.now() - startTime
      log('INFO', `Resend API responded in ${responseTime}ms`, { status: resendResponse.status })
    } catch (fetchError) {
      log('ERROR', 'Failed to reach Resend API', { error: String(fetchError) })
      return new Response(
        JSON.stringify({ 
          error: 'Network error',
          message: 'Could not reach Resend API. Check internet connection.',
          details: String(fetchError)
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // STEP 4: Parse and Handle Response
    // ============================================
    log('INFO', '📥 Parsing Resend API response')
    
    let resendData
    try {
      resendData = await resendResponse.json()
    } catch (parseError) {
      log('ERROR', 'Failed to parse Resend response', { error: String(parseError) })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API response',
          message: 'Resend API returned invalid JSON'
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if request was successful
    if (!resendResponse.ok) {
      log('ERROR', '🔴 Resend API returned error', {
        status: resendResponse.status,
        message: resendData.message,
        error: resendData.error
      })
      
      // Analyze error for better debugging
      let debugHint = ''
      if (resendData.message?.includes('Invalid API token')) {
        debugHint = 'Hint: Check if API key is valid and starts with "re_"'
      } else if (resendData.message?.includes('rate limit')) {
        debugHint = 'Hint: Free tier limited to 150 emails/day'
      } else if (resendData.message?.includes('domain')) {
        debugHint = 'Hint: Verify sender domain in Resend dashboard'
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          message: resendData.message || 'Unknown error from Resend API',
          status: resendResponse.status,
          debugHint,
          details: resendData
        }),
        { status: resendResponse.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // STEP 5: Success
    // ============================================
    log('INFO', '✅ Email sent successfully!')
    log('INFO', '📨 Message ID: ' + resendData.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: resendData
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    log('ERROR', '💥 Unexpected error in send-email function')
    log('ERROR', String(error))
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
