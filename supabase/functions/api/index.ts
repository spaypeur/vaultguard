import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { authenticateRequest } from '../_shared/auth.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Basic API route that works with your existing frontend
    if (req.method === 'GET' && new URL(req.url).pathname === '/api/csrf-token') {
      return new Response(
        JSON.stringify({ csrfToken: 'vaultguard-csrf-token-free' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Authentication endpoint
    if (req.method === 'POST' && new URL(req.url).pathname === '/api/auth/login') {
      const { user, error } = await authenticateRequest(req)
      if (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          user,
          token: 'vaultguard-jwt-token-free',
          message: 'Login successful'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Admin routes
    if (new URL(req.url).pathname.startsWith('/api/admin')) {
      const { user, error } = await authenticateRequest(req)
      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          adminData: 'VaultGuard admin panel data',
          user: user.email,
          features: ['Compliance', 'Security', 'Monitoring']
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Default response for unmatched routes
    return new Response(
      JSON.stringify({
        message: 'VaultGuard API - Free Hosting Edition',
        version: '1.0.0',
        status: 'operational'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})