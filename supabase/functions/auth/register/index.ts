import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, handleError, handleSuccess } from '../../_shared/index.ts';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== 'POST') {
      return handleError('Method not allowed', 405);
    }

    const { email, password, firstName, lastName }: RegisterRequest = await req.json();

    if (!email || !password) {
      return handleError('Email and password are required', 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return handleError(error.message, 400);
    }

    return handleSuccess({
      user: data.user,
      session: data.session,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    return handleError(error);
  }
});