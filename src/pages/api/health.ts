/**
 * Health Check API Route — PB-046 Prerequisite
 * Lightweight endpoint for ecosystem probe liveness checks.
 * No side effects, no auth required.
 */
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
