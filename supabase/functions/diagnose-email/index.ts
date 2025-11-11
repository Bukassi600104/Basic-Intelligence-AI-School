// Enhanced Diagnostic Edge Function for Email Sending
// Deploy as: supabase/functions/diagnose-email/index.ts
// Purpose: Debug email sending issues with detailed logging and Resend API testing

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface DiagnosticsReport {
  timestamp: string
  environment: {
    apiKeyPresent: boolean
    apiKeyFormat: string
    apiKeyLength: number
  }
  connectivity: {
    resendApiReachable: boolean
    responseTime: number
  }
  configuration: {
    testResult: string
    recommendations: string[]
  }
  testEmail?: {
    success: boolean
    messageId?: string
    error?: string
  }
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    console.log('=== EMAIL DIAGNOSTICS STARTED ===')
    
    const report: DiagnosticsReport = {
      timestamp: new Date().toISOString(),
      environment: {
        apiKeyPresent: !!RESEND_API_KEY,
        apiKeyFormat: 'UNKNOWN',
        apiKeyLength: 0
      },
      connectivity: {
        resendApiReachable: false,
        responseTime: 0
      },
      configuration: {
        testResult: '',
        recommendations: []
      }
    }

    // ============================================
    // STEP 1: Check API Key Environment Variable
    // ============================================
    console.log('\n📋 STEP 1: Checking API Key Configuration')
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment variables')
      report.environment.apiKeyFormat = 'MISSING'
      report.configuration.recommendations.push(
        '🔴 CRITICAL: RESEND_API_KEY not set in Supabase Edge Function Secrets'
      )
      report.configuration.testResult = 'FAILED - Missing API Key'
      
      return new Response(
        JSON.stringify(report, null, 2),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate API key format
    const keyFormat = RESEND_API_KEY.startsWith('re_') ? 'VALID' : 'INVALID'
    const keyLength = RESEND_API_KEY.length
    
    report.environment.apiKeyFormat = keyFormat
    report.environment.apiKeyLength = keyLength

    console.log(`✅ API Key found: ${keyLength} characters`)
    console.log(`Format: ${keyFormat} (starts with 're_': ${RESEND_API_KEY.startsWith('re_')})`)

    if (keyFormat === 'INVALID') {
      report.configuration.recommendations.push(
        '🟠 WARNING: API Key does not start with "re_" - may be invalid'
      )
    }

    // ============================================
    // STEP 2: Test Resend API Connectivity
    // ============================================
    console.log('\n🌐 STEP 2: Testing Resend API Connectivity')

    const startTime = Date.now()
    
    try {
      // Test with simple GET to Resend API info endpoint
      const testResponse = await fetch('https://api.resend.com/emails', {
        method: 'OPTIONS', // Preflight to check connectivity
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime
      report.connectivity.responseTime = responseTime

      console.log(`Response Status: ${testResponse.status}`)
      console.log(`Response Time: ${responseTime}ms`)

      // Check if we got a response from Resend
      if (testResponse.status < 500) {
        report.connectivity.resendApiReachable = true
        console.log('✅ Resend API is reachable')
      } else {
        console.error('❌ Resend API returned 5xx error')
        report.configuration.recommendations.push(
          '🟠 Resend API returned server error - may be temporary'
        )
      }
    } catch (connectError) {
      console.error('❌ Failed to reach Resend API:', connectError.message)
      report.configuration.recommendations.push(
        `🔴 Cannot reach Resend API: ${connectError.message}`
      )
    }

    // ============================================
    // STEP 3: Test Email Sending (Optional)
    // ============================================
    console.log('\n📧 STEP 3: Testing Email Send')

    const requestBody = await req.json().catch(() => ({}))
    const testEmail = requestBody.testEmail || 'test@example.com'

    if (req.method === 'POST') {
      try {
        console.log(`Sending test email to: ${testEmail}`)

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Basic Intelligence <onboarding@resend.dev>',
            to: testEmail,
            subject: '🧪 Email Diagnostics Test',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Email Test</title>
              </head>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>✅ Email System Diagnostic Test</h2>
                <p>If you received this email, your email system is working!</p>
                <p>Test Timestamp: ${new Date().toISOString()}</p>
                <hr>
                <h3>Diagnostic Summary:</h3>
                <ul>
                  <li>API Key Format: ${report.environment.apiKeyFormat}</li>
                  <li>API Key Length: ${report.environment.apiKeyLength}</li>
                  <li>Resend API Reachable: ${report.connectivity.resendApiReachable}</li>
                  <li>Response Time: ${report.connectivity.responseTime}ms</li>
                </ul>
                <p style="color: #666; font-size: 12px;">
                  Basic Intelligence Community School
                </p>
              </body>
              </html>
            `
          })
        })

        const resendData = await emailResponse.json()

        if (emailResponse.ok) {
          console.log('✅ Email sent successfully!')
          console.log('Message ID:', resendData.id)
          
          report.testEmail = {
            success: true,
            messageId: resendData.id
          }

          report.configuration.testResult = 'SUCCESS - Email System Working'
          report.configuration.recommendations.push(
            '✅ Email system is operational'
          )
        } else {
          console.error('❌ Resend API error:', resendData)
          
          report.testEmail = {
            success: false,
            error: resendData.message || 'Unknown error'
          }

          // Analyze error
          if (resendData.message?.includes('Invalid API token')) {
            report.configuration.recommendations.push(
              '🔴 Invalid API key or key has been revoked'
            )
          } else if (resendData.message?.includes('rate limit')) {
            report.configuration.recommendations.push(
              '🟡 Rate limit exceeded - wait before sending more emails'
            )
          } else if (resendData.message?.includes('domain not verified')) {
            report.configuration.recommendations.push(
              '🟠 Sender domain not verified in Resend'
            )
          } else {
            report.configuration.recommendations.push(
              `Error from Resend: ${resendData.message}`
            )
          }

          report.configuration.testResult = `FAILED - ${resendData.message}`
        }
      } catch (sendError) {
        console.error('❌ Error sending test email:', sendError.message)
        
        report.testEmail = {
          success: false,
          error: sendError.message
        }

        report.configuration.recommendations.push(
          `Failed to send test email: ${sendError.message}`
        )
        report.configuration.testResult = `ERROR - ${sendError.message}`
      }
    }

    // ============================================
    // FINAL RECOMMENDATIONS
    // ============================================
    console.log('\n📝 FINAL RECOMMENDATIONS')

    if (!report.configuration.recommendations.length) {
      report.configuration.recommendations.push(
        '✅ All systems operational - email sending should work'
      )
    }

    // Add general best practices
    if (report.environment.apiKeyFormat === 'VALID' && report.connectivity.resendApiReachable) {
      report.configuration.recommendations.push(
        '💡 Tip: Monitor email logs for any delivery issues'
      )
      report.configuration.recommendations.push(
        '💡 Tip: Set up custom domain for production use'
      )
    }

    console.log('=== EMAIL DIAGNOSTICS COMPLETE ===\n')

    return new Response(
      JSON.stringify(report, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Critical error in diagnostics:', error)

    return new Response(
      JSON.stringify({
        error: 'Diagnostic function error',
        message: error.message,
        timestamp: new Date().toISOString()
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

// How to use this diagnostic function:
// 
// 1. GET request to check configuration:
//    curl -X GET https://[project].functions.supabase.co/diagnose-email
//
// 2. POST request to test email sending:
//    curl -X POST https://[project].functions.supabase.co/diagnose-email \
//      -H "Content-Type: application/json" \
//      -d '{"testEmail": "your-email@example.com"}'
//
// Response format:
// {
//   "timestamp": "2025-11-11T...",
//   "environment": {
//     "apiKeyPresent": true/false,
//     "apiKeyFormat": "VALID" | "INVALID" | "MISSING",
//     "apiKeyLength": 50
//   },
//   "connectivity": {
//     "resendApiReachable": true/false,
//     "responseTime": 123
//   },
//   "configuration": {
//     "testResult": "SUCCESS",
//     "recommendations": [...]
//   },
//   "testEmail": {
//     "success": true/false,
//     "messageId": "xxx",
//     "error": "error message"
//   }
// }
