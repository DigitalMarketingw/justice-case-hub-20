
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's Google Calendar settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('google_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_connected', true)
      .maybeSingle()

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action } = await req.json()

    if (action === 'sync_events') {
      // Check if token needs refresh
      let accessToken = settings.access_token
      if (settings.token_expires_at && new Date(settings.token_expires_at) <= new Date()) {
        // Token expired, refresh it
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
            refresh_token: settings.refresh_token ?? '',
            grant_type: 'refresh_token',
          }),
        })

        const refreshData = await refreshResponse.json()
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token
          const expiresAt = new Date(Date.now() + (refreshData.expires_in * 1000))
          
          // Update tokens in database
          await supabaseClient
            .from('google_calendar_settings')
            .update({
              access_token: accessToken,
              token_expires_at: expiresAt.toISOString(),
            })
            .eq('user_id', user.id)
        } else {
          return new Response(
            JSON.stringify({ error: 'Failed to refresh token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Get events from local database
      const { data: localEvents, error: localError } = await supabaseClient
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .is('google_event_id', null) // Only get events not yet synced to Google

      if (localError) {
        console.error('Error fetching local events:', localError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch local events' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Sync local events to Google Calendar
      for (const event of localEvents || []) {
        try {
          const googleEvent = {
            summary: event.title,
            description: event.description,
            start: {
              dateTime: event.start_time,
              timeZone: 'UTC',
            },
            end: {
              dateTime: event.end_time,
              timeZone: 'UTC',
            },
            location: event.location,
            attendees: event.attendees?.map((email: string) => ({ email })),
          }

          const createResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${settings.google_calendar_id}/events`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(googleEvent),
            }
          )

          if (createResponse.ok) {
            const createdEvent = await createResponse.json()
            
            // Update local event with Google event ID
            await supabaseClient
              .from('calendar_events')
              .update({
                google_event_id: createdEvent.id,
                is_google_synced: true,
              })
              .eq('id', event.id)
          } else {
            console.error('Failed to create Google event:', await createResponse.text())
          }
        } catch (error) {
          console.error('Error syncing event:', error)
        }
      }

      // Import recent events from Google Calendar
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
      const googleEventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.google_calendar_id}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (googleEventsResponse.ok) {
        const googleEventsData = await googleEventsResponse.json()
        
        for (const gEvent of googleEventsData.items || []) {
          // Check if event already exists locally
          const { data: existingEvent } = await supabaseClient
            .from('calendar_events')
            .select('id')
            .eq('google_event_id', gEvent.id)
            .maybeSingle()

          if (!existingEvent && gEvent.start?.dateTime) {
            // Import new event from Google
            await supabaseClient
              .from('calendar_events')
              .insert({
                title: gEvent.summary || 'Untitled Event',
                description: gEvent.description || null,
                start_time: gEvent.start.dateTime,
                end_time: gEvent.end?.dateTime || gEvent.start.dateTime,
                location: gEvent.location || null,
                google_event_id: gEvent.id,
                is_google_synced: true,
                event_type: 'imported',
                attendees: gEvent.attendees?.map((a: any) => a.email).filter(Boolean) || null,
              })
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Events synced successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
