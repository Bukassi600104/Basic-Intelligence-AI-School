// Supabase Edge Function for sending emails via Resend
// This runs server-side, so API keys are secure

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    // Verify request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured',
          message: 'Please set RESEND_API_KEY in Supabase Edge Function secrets'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const emailRequest: EmailRequest = await req.json()
    
    // Validate required fields
    if (!emailRequest.to || !emailRequest.subject || !emailRequest.html) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          message: 'to, subject, and html are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
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

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          message: resendData.message || 'Unknown error from Resend API',
          details: resendData
        }),
        {
          status: resendResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Email sent successfully:', resendData)

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
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
