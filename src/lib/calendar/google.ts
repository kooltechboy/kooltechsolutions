import crypto from "crypto";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";

interface CalendarEventResult {
  googleEventId: string | null;
  meetingLink: string | null;
}

/**
 * Decode and parse service account credentials from env variable.
 * Supports both base64 encoded JSON and raw JSON string.
 */
function getServiceAccountCredentials(): { private_key: string; client_email: string } | null {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) return null;

  try {
    // Try base64 decoding first
    const decoded = Buffer.from(rawKey, "base64").toString("utf8");
    if (decoded.includes("private_key") && decoded.includes("client_email")) {
      return JSON.parse(decoded);
    }
  } catch {}

  try {
    // Fall back to direct JSON parse
    const parsed = JSON.parse(rawKey);
    if (parsed.private_key && parsed.client_email) {
      return parsed;
    }
  } catch {}

  return null;
}

/**
 * Generates an OAuth2 access token using a Service Account JSON Key (JWT).
 */
async function getServiceAccountAccessToken(
  privateKey: string,
  clientEmail: string
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/calendar.events",
    aud: "https://oauth2.googleapis.com/token",
    exp,
    iat,
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signatureInput = `${base64Header}.${base64Payload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signatureInput);
  const signature = signer.sign(privateKey, "base64url");

  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Google JWT auth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Generates an OAuth2 access token using Client ID, Client Secret, and Refresh Token.
 */
async function getOAuthAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing client_id, client_secret, or refresh_token");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Google OAuth refresh error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Gets a valid Google Calendar API access token using configured auth strategy.
 */
async function getGoogleAccessToken(): Promise<string | null> {
  // Strategy 1: Service Account
  const credentials = getServiceAccountCredentials();
  if (credentials) {
    try {
      return await getServiceAccountAccessToken(credentials.private_key, credentials.client_email);
    } catch (err) {
      console.error("[Google Calendar] Service Account Auth failed:", err);
    }
  }

  // Strategy 2: OAuth2 Refresh Token
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    try {
      return await getOAuthAccessToken();
    } catch (err) {
      console.error("[Google Calendar] OAuth Refresh Token Auth failed:", err);
    }
  }

  return null;
}

/**
 * Syncs a booking to Google Calendar and generates a Google Meet link.
 */
export async function createCalendarEvent(params: {
  name: string;
  email: string;
  service: string;
  scheduledAt: string; // ISO String
  durationMins?: number;
  notes?: string;
}): Promise<CalendarEventResult> {
  const { name, email, service, scheduledAt, durationMins = 30, notes = "" } = params;

  try {
    const token = await getGoogleAccessToken();
    if (!token) {
      console.warn("[Google Calendar] Not configured. Skipping event creation.");
      return { googleEventId: null, meetingLink: null };
    }

    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

    const eventBody = {
      summary: `KoolTech Consultation: ${name} (${service})`,
      description: `Client: ${name}\nEmail: ${email}\nService: ${service}\nNotes: ${notes}`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      attendees: [{ email }],
      conferenceData: {
        createRequest: {
          requestId: `kts-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events?conferenceDataVersion=1`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google Calendar Event Create failed: ${res.status} ${errText}`);
    }

    const event = await res.json();
    const googleEventId = event.id || null;

    // Locate Google Meet link in response
    let meetingLink: string | null = null;
    const entryPoints = event.conferenceData?.entryPoints || [];
    for (const ep of entryPoints) {
      if (ep.entryPointType === "video" && ep.uri) {
        meetingLink = ep.uri;
        break;
      }
    }

    console.log(`[Google Calendar] Created event ${googleEventId} with Meet link ${meetingLink}`);
    return { googleEventId, meetingLink };
  } catch (err) {
    console.error("[Google Calendar] Failed to create event:", err);
    return { googleEventId: null, meetingLink: null };
  }
}

/**
 * Removes an event from Google Calendar.
 */
export async function deleteCalendarEvent(googleEventId: string): Promise<boolean> {
  if (!googleEventId) return false;

  try {
    const token = await getGoogleAccessToken();
    if (!token) return false;

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      CALENDAR_ID
    )}/events/${encodeURIComponent(googleEventId)}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok && res.status !== 404) {
      console.error(`[Google Calendar] Delete event failed: ${res.status}`);
      return false;
    }

    console.log(`[Google Calendar] Deleted event ${googleEventId}`);
    return true;
  } catch (err) {
    console.error("[Google Calendar] Failed to delete event:", err);
    return false;
  }
}
