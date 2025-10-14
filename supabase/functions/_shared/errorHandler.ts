import { corsHeaders } from './cors.ts';

export function handleError(error: Error | string, status = 500): Response {
  const errorMessage = error instanceof Error ? error.message : error;
  console.error('Error:', errorMessage);

  return new Response(
    JSON.stringify({ error: errorMessage }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function handleSuccess(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}