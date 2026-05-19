"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Fetch the most recent tickets for the authenticated user.
 * Returns [] if unauthenticated or on error — never throws to the caller.
 */
export async function getTickets() {
  const supabase = await createClient();

  // Auth guard — server actions must verify auth independently
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn("[getTickets] Called without authentication");
    return [];
  }

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[getTickets] Error fetching tickets:", error.message);
    return [];
  }

  return tickets;
}

/**
 * Create a new ticket for the authenticated user.
 * Throws a safe user-facing error if auth fails or DB insert fails.
 */
export async function createTicket(
  subject: string,
  description: string,
  priority: string
) {
  // Basic input sanity (full validation should happen at the form layer)
  if (!subject?.trim() || !description?.trim()) {
    throw new Error("Subject and description are required.");
  }

  const safeSubject = subject.trim().slice(0, 200);
  const safeDescription = description.trim().slice(0, 5000);
  const safePriority = ["low", "normal", "high", "critical"].includes(priority)
    ? priority
    : "normal";

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to create a ticket.");
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert([
      {
        user_id: user.id,
        subject: safeSubject,
        description: safeDescription,
        priority: safePriority,
        status: "Open",
      },
    ])
    .select();

  if (error) {
    console.error("[createTicket] DB error:", error.message);
    throw new Error("Failed to create ticket. Please try again.");
  }

  return data;
}
