/**
 * Contact Form API Route
 * Handles form submissions from the contact page.
 *
 * Current: Validates input and returns success.
 * TODO (Phase 3): Add Notion API + Resend email integration.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

// Simple rate limiting: track submissions per IP
const submissions = new Map<string, { count: number; firstSubmit: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

export const POST: APIRoute = async ({ request }) => {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting
    const now = Date.now();
    const record = submissions.get(ip);
    if (record) {
      if (now - record.firstSubmit < RATE_WINDOW) {
        if (record.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
        record.count++;
      } else {
        submissions.set(ip, { count: 1, firstSubmit: now });
      }
    } else {
      submissions.set(ip, { count: 1, firstSubmit: now });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check honeypot
    if (data.website) {
      // Bot detected — return success silently
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Send to Notion API
    // TODO: Send email notification via Resend
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      company: data.company || '',
      role: data.role || '',
      message: data.message || '',
      timestamp: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
