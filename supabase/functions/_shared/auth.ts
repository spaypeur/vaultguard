import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const supabaseAdmin: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

export async function authenticateRequest(req: Request): Promise<{ user: any, error: any }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return { user: null, error: { message: 'No authorization header' } }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  return { user, error }
}

export async function authenticateUser(req: Request) {
  const { user, error } = await authenticateRequest(req)
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }
  return authenticateUser(req)
}