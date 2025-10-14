import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, handleError, handleSuccess } from '../../_shared/index.ts';

interface LoginRequest {
  email: string;
  password: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== 'POST') {
      return handleError('Method not allowed', 405);
    }

    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return handleError('Email and password are required', 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return handleError(error.message, 401);
    }

    return handleSuccess({
      user: data.user,
      session: data.session,
      message: 'Login successful'
    });
  } catch (error) {
    return handleError(error);
  }
});