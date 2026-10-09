
/**
 * GreenFlare Resend Email Edge Function
 * Runs in Supabase's Deno runtime.
 *
 * Required secrets:
 * RESEND_API_KEY
 * RESEND_FROM_EMAIL
 * GREENFLARE_EMAIL_FUNCTION_SECRET
 */

export {};

type EdgeRuntime = {
  serve: (
    handler: (
      request: Request
    ) => Response | Promise<Response>
  ) => void;

  env: {
    get: (name: string) => string | undefined;
  };
};

const runtime = (
  globalThis as unknown as { Deno: EdgeRuntime }
).Deno;

runtime.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
    });
  }

  const secret = runtime.env.get(
    'GREENFLARE_EMAIL_FUNCTION_SECRET'
  );

  if (
    !secret ||
    req.headers.get('authorization') !== `Bearer ${secret}`
  ) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Invalid notification' },
        { status: 400 }
      );
    }

    const { to, subject, text } = body as Record<
      string,
      unknown
    >;

    if (
      typeof to !== 'string' ||
      !/^\S+@\S+\.\S+$/.test(to) ||
      typeof subject !== 'string' ||
      !subject.trim() ||
      subject.length > 120 ||
      typeof text !== 'string' ||
      text.length > 10000
    ) {
      return Response.json(
        { error: 'Invalid notification' },
        { status: 400 }
      );
    }

    const apiKey = runtime.env.get('RESEND_API_KEY');
    const from = runtime.env.get('RESEND_FROM_EMAIL');

    if (!apiKey || !from) {
      return Response.json(
        { error: 'Notification credentials not configured' },
        { status: 500 }
      );
    }

    const resendResponse = await fetch(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          text,
        }),
      }
    );

    const result: unknown = await resendResponse.json();

    return Response.json(result, {
      status: resendResponse.status,
    });
  } catch {
    return Response.json(
      { error: 'Unable to send email' },
      { status: 500 }
    );
  }
});
