import { z } from "zod";

// ─── Shared primitives ────────────────────────────────────────────────────────

const safeString = (max: number) =>
  z.string().trim().min(1).max(max);

const emailField = z.string().trim().email().max(254).toLowerCase();

const phoneField = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s\-().]*$/, "Invalid phone number")
  .optional()
  .or(z.literal(""));

// ─── Contact form ─────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: safeString(100),
  email: emailField,
  phone: phoneField,
  company: safeString(150).optional().or(z.literal("")),
  service: safeString(100),
  message: safeString(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ─── Booking / demo scheduling ────────────────────────────────────────────────

const ALLOWED_TIMES = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
] as const;

export const bookingSchema = z.object({
  name: safeString(100),
  email: emailField,
  phone: phoneField,
  service: safeString(100).optional().or(z.literal("")),
  message: safeString(1000).optional().or(z.literal("")),
  date: safeString(60), // e.g. "Wednesday, May 20"
  time: z.string().refine(
    (t) => ALLOWED_TIMES.includes(t as (typeof ALLOWED_TIMES)[number]),
    "Invalid time slot"
  ),
  customStack: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        code: z.string(),
        price: z.string(),
        priceType: z.string(),
      })
    )
    .optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

// ─── Support ticket ───────────────────────────────────────────────────────────

const TICKET_PRIORITIES = ["low", "normal", "high", "critical"] as const;

export const ticketSchema = z.object({
  subject: safeString(200),
  description: safeString(5000),
  priority: z.enum(TICKET_PRIORITIES).default("normal"),
  client_id: z.string().uuid().optional(),
});

export type TicketInput = z.infer<typeof ticketSchema>;



// ─── Blog refine ──────────────────────────────────────────────────────────────

const BLOG_MODES = ["refine", "complete", "generate"] as const;

export const blogRefineSchema = z.object({
  content: z.string().max(50000).optional(),
  instruction: z.string().max(500).optional(),
  mode: z.enum(BLOG_MODES).default("refine"),
  title: z.string().max(300).optional(),
});

export type BlogRefineInput = z.infer<typeof blogRefineSchema>;
