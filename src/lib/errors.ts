import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API error response shapes — never expose raw error messages
 * from DB, runtime, or third-party services to the client.
 */

export function apiError(
  message: string,
  status: number,
  details?: string
): NextResponse {
  // In development, include more detail. In production, keep it vague.
  const body =
    process.env.NODE_ENV === "development" && details
      ? { error: message, detail: details }
      : { error: message };
  return NextResponse.json(body, { status });
}

export function validationError(err: ZodError): NextResponse {
  const issues = err.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));
  return NextResponse.json({ error: "Invalid request data", issues }, { status: 400 });
}

export function unauthorizedError(message = "Authentication required"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenError(message = "Insufficient permissions"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function rateLimitError(resetAt: number): NextResponse {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Math.floor(resetAt / 1000)),
      },
    }
  );
}

/**
 * Wraps an unknown caught error. Logs internally, returns safe client response.
 */
export function serverError(err: unknown, context?: string): NextResponse {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  console.error(`[API Error]${context ? ` [${context}]` : ""}:`, message);
  return apiError("An internal error occurred. Please try again.", 500);
}

/**
 * Sanitize a string before embedding into HTML email templates.
 * Prevents HTML injection via user-submitted form fields.
 */
export function sanitizeForEmail(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
