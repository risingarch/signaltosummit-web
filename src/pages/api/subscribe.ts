/**
 * Subscribe API Route — PB-044 Phase 1
 * Captures email subscriptions to Supabase kit.subscribers table.
 * Uses anon key + RLS (not service key) per security requirements.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

// Rate limiting: 5 requests per IP per minute
const rateLimits = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000; // 1 minute

const VALID_SOURCES = [
  'hub_hero',
  'mid_read',
  'footer',
  'article_bottom',
  'comment_placeholder',
  'sidebar',
] as const;

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const record = rateLimits.get(ip);

    if (record) {
      if (now - record.windowStart < RATE_WINDOW) {
        if (record.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ success: false, message: 'Too many requests. Please try again in a minute.' }),
            { status: 429, headers }
          );
        }
        record.count++;
      } else {
        rateLimits.set(ip, { count: 1, windowStart: now });
      }
    } else {
      rateLimits.set(ip, { count: 1, windowStart: now });
    }

    // Parse body
    const body = await request.json();
    const { email, name, source, metadata } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: 'Please enter your email address.' }),
        { status: 400, headers }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please enter a valid email address.' }),
        { status: 400, headers }
      );
    }

    // Validate source
    if (!source || !VALID_SOURCES.includes(source)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
        { status: 400, headers }
      );
    }

    // Supabase config from env
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
    const cfClientId = import.meta.env.CF_ACCESS_CLIENT_ID;
    const cfClientSecret = import.meta.env.CF_ACCESS_CLIENT_SECRET;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
        { status: 500, headers }
      );
    }

    // Build headers for Supabase REST API
    const supabaseHeaders: Record<string, string> = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Content-Profile': 'kit',
      'Accept-Profile': 'kit',
    };

    // Add Cloudflare Access headers if configured (production)
    if (cfClientId && cfClientSecret) {
      supabaseHeaders['CF-Access-Client-Id'] = cfClientId;
      supabaseHeaders['CF-Access-Client-Secret'] = cfClientSecret;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(cleanEmail)}&select=id`,
      { headers: supabaseHeaders }
    );

    if (!checkRes.ok) {
      console.error('Supabase SELECT failed:', checkRes.status, await checkRes.text());
      return new Response(
        JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
        { status: 500, headers }
      );
    }

    const existing = await checkRes.json();
    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: "You're already subscribed!" }),
        { status: 200, headers }
      );
    }

    // Insert new subscriber
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
      method: 'POST',
      headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        email: cleanEmail,
        name: name?.trim() || null,
        source,
        metadata: metadata || null,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      // Handle race condition duplicate
      if (errText.includes('duplicate') || errText.includes('unique')) {
        return new Response(
          JSON.stringify({ success: true, message: "You're already subscribed!" }),
          { status: 200, headers }
        );
      }
      console.error('Supabase INSERT failed:', insertRes.status, errText);
      return new Response(
        JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Thanks! You're on the list." }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Something went wrong. Try again.' }),
      { status: 500, headers }
    );
  }
};
