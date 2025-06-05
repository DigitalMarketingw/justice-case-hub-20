
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state') // This is the user ID
    const error = url.searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return new Response(`
        <html>
          <body>
            <h1>Authorization Failed</h1>
            <p>Error: ${error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    if (!code || !state) {
      return new Response(`
        <html>
          <body>
            <h1>Invalid Request</h1>
            <p>Missing authorization code or state parameter.</p>
            <script>window.close();</script>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } })
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-callback`

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured')
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData)
      throw new Error('Failed to exchange authorization code for tokens')
    }

    // Get user's calendar list to find primary calendar
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const calendarData = await calendarResponse.json()
    const primaryCalendar = calendarData.items?.find((cal: any) => cal.primary)

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

    // Save tokens to database
    const { error: dbError } = await supabaseAdmin
      .from('google_calendar_settings')
      .upsert({
        user_id: state,
        google_calendar_id: primaryCalendar?.id || null,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save tokens')
    }

    return new Response(`
      <html>
        <body>
          <h1>Authorization Successful!</h1>
          <p>Your Google Calendar has been connected successfully.</p>
          <script>
            // Post message to parent window and close
            window.opener?.postMessage({ type: 'google-auth-success' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })

  } catch (error) {
    console.error('Callback error:', error)
    return new Response(`
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>An error occurred during authorization. Please try again.</p>
          <script>window.close();</script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }
})
