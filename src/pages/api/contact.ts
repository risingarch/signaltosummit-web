/**
 * Contact Form API Route
 * Handles form submissions from the Let's Talk page.
 *
 * Pipeline: Validate → Supabase (primary) → Notion (viewable) → Return success
 * Notification handled by Mac mini polling script (not in this route).
 */
import type { APIRoute } from 'astro';

export const prerender = false;

// Simple rate limiting: track submissions per IP
const submissions = new Map<string, { count: number; firstSubmit: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

const NOTION_DB_ID = '31e9d51a-a4bb-81b1-a472-f628f6750ea7';

export const POST: APIRoute = async ({ request }) => {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Rate limiting
    const now = Date.now();
    const record = submissions.get(ip);
    if (record) {
      if (now - record.firstSubmit < RATE_WINDOW) {
        if (record.count >= RATE_LIMIT) {
          return new Response(
            JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
            { status: 429, headers }
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
        { status: 400, headers }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { status: 400, headers }
      );
    }

    // Check honeypot
    if (data.website) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
      );
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const submittedAt = new Date().toISOString();

    // ── 1. Write to Supabase (primary storage) ──
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
    const cfClientId = import.meta.env.CF_ACCESS_CLIENT_ID;
    const cfClientSecret = import.meta.env.CF_ACCESS_CLIENT_SECRET;

    if (supabaseUrl && supabaseAnonKey) {
      const supabaseHeaders: Record<string, string> = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'kit',
      };

      if (cfClientId && cfClientSecret) {
        supabaseHeaders['CF-Access-Client-Id'] = cfClientId;
        supabaseHeaders['CF-Access-Client-Secret'] = cfClientSecret;
      }

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify({
            name: data.name.trim(),
            email: cleanEmail,
            company: data.company?.trim() || null,
            role: data.role?.trim() || null,
            message: data.message?.trim() || null,
          }),
        });

        if (!res.ok) {
          console.error('Supabase contact insert failed:', res.status, await res.text());
        }
      } catch (err) {
        console.error('Supabase contact insert error:', err);
      }
    }

    // ── 2. Write to Notion (viewable table) ──
    const notionToken = import.meta.env.NOTION_TOKEN;

    if (notionToken) {
      try {
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            parent: { database_id: NOTION_DB_ID },
            properties: {
              'Name': { title: [{ text: { content: data.name.trim() } }] },
              'Email': { email: cleanEmail },
              'Company': { rich_text: [{ text: { content: data.company?.trim() || '' } }] },
              'Role': { rich_text: [{ text: { content: data.role?.trim() || '' } }] },
              'Message': { rich_text: [{ text: { content: (data.message?.trim() || '').slice(0, 2000) } }] },
              'Status': { select: { name: 'New' } },
              'Submitted': { date: { start: submittedAt } },
            },
          }),
        });
      } catch (err) {
        console.error('Notion contact insert error:', err);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers }
    );
  }
};
