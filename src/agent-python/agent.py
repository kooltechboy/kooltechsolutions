"""
KoolTech Solutions — LiveKit Python Voice Agent
================================================
Supports: Sales (BANT lead qualification), Customer Service (RAG grounding),
Appointment Scheduling, Technical Support, Human Escalation.
Compatible with SIP inbound/outbound calls via LiveKit SIP integration.

Architecture:
  - livekit-agents 1.6.x (AgentSession + function_tool)
  - google.beta.realtime.RealtimeModel (Gemini Live native audio)
  - Supabase for CRM, tickets, bookings, sessions, and transcript logs
  - httpx for outbound REST calls to Next.js APIs

Personas (mapped by room metadata sent from the frontend token API):
  Kira   — Home / About  (Aoede voice) — Executive Concierge
  Aria   — Pricing / Contact (Kore voice) — Lead Qualifier & Booking
  Max    — Services (Charon voice) — Senior Solutions Architect
  Cortex — Portal / Support (Puck voice) — L3 Support Engineer
"""

import os
import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from supabase import create_client as create_supabase_client

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    function_tool,
    RoomInputOptions,
)
from livekit.plugins.google.realtime import RealtimeModel

# ── Environment ──────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)
logger = logging.getLogger("kooltech.agent")

LIVEKIT_URL    = os.environ.get("LIVEKIT_URL", "")
LIVEKIT_API_KEY    = os.environ.get("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "")
# RealtimeModel reads GOOGLE_API_KEY automatically, but we keep a reference here
GOOGLE_API_KEY = (
    os.environ.get("GOOGLE_API_KEY")
    or os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")
    or ""
)
SUPABASE_URL   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY   = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Base URL for calling Next.js API endpoints from within the agent
SITE_URL = os.environ.get("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")

# ── Supabase client ───────────────────────────────────────────────────────────
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_supabase_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("Supabase client initialised")
else:
    logger.warning("Supabase credentials missing — DB features disabled")


# ── Persona configuration ─────────────────────────────────────────────────────
PERSONA_MAP = {
    "Aria": {
        "voice": "Kore",
        "role": "Strategic Coordinator",
        "instructions": (
            "Your ONLY goal is to qualify the visitor and schedule a live demo. "
            "Ask ONE question at a time. Gather name, email, phone (optional), and service interest. "
            "Always call get_available_slots before proposing a date/time. "
            "Confirm ALL details verbally before calling book_demo."
        ),
    },
    "Cortex": {
        "voice": "Puck",
        "role": "L3 Support Engineer",
        "instructions": (
            "Help authenticated clients troubleshoot IT issues. "
            "Ask for error codes or symptoms before diagnosing. Be concise and precise. "
            "For complex or unresolvable issues, call create_ticket. "
            "For critical issues (system down, ransomware, data breach), call escalate_to_human IMMEDIATELY. "
            "Never guess a technical fix if you are not certain."
        ),
    },
    "Max": {
        "voice": "Charon",
        "role": "Senior Solutions Architect",
        "instructions": (
            "Answer complex technical questions about cybersecurity, cloud, networking, and infrastructure. "
            "Call get_knowledge before quoting any spec, price, or SLA number. "
            "Recommend enterprise-grade solutions and offer to book a scoping session via book_demo."
        ),
    },
    "Nexus": {
        "voice": "Fenrir",
        "role": "Growth Intelligence",
        "instructions": (
            "Analyse sales velocity and lead quality for the internal admin team. "
            "Provide growth insights and strategic recommendations. This persona is internal-only."
        ),
    },
}

DEFAULT_PERSONA = {
    "voice": "Aoede",
    "role": "Executive Concierge",
    "instructions": (
        "Greet visitors warmly and discover their IT needs. "
        "Call get_available_slots to show real open times. "
        "Confirm all details before booking. "
        "Always call get_knowledge before answering any pricing or feature question."
    ),
}

KNOWLEDGE_FALLBACK = (
    "That's a great question and I want to be precise with you. "
    "Rather than guessing, let me get one of our specialists on that. "
    "Can I take your contact info and have them reach out directly?"
)

SERVICES_OVERVIEW = """
KoolTech Solutions is a premium MSP serving the Dominican Republic, USA, Canada, and the Caribbean.

Core services:
- Managed IT (HDS): 24/7 helpdesk, monitoring, patch management
- Cybersecurity & SOC: Threat detection, incident response, SIEM
- Cloud Services: Microsoft 365, Azure, Google Workspace, hybrid cloud
- Network Management: SD-WAN, firewall, VoIP / Secure Communications
- Compliance as a Service: HIPAA, PCI-DSS, SOC 2, ISO 27001
- Backup & Disaster Recovery: Immutable backups, RTO/RPO planning
- AI & Automation: Custom AI agents, workflow automation

Always call get_knowledge for accurate pricing, SLAs, and feature details.
"""


# ── Database helpers ──────────────────────────────────────────────────────────

def _log_to_supabase(session_id: str, role: str, content: str, agent_name: str):
    """Fire-and-forget telemetry insert into agent_logs."""
    if not supabase or not content.strip():
        return
    try:
        supabase.table("agent_logs").insert({
            "session_id": session_id,
            "role": role,
            "content": content.strip(),
            "agent_name": agent_name,
        }).execute()
    except Exception as e:
        logger.warning(f"Telemetry log failed: {e}")


def _upsert_session(session_id: str, agent_name: str):
    """Upsert agent_sessions row to track active voice sessions."""
    if not supabase:
        return
    try:
        supabase.table("agent_sessions").upsert({
            "session_id": session_id,
            "agent_name": agent_name,
            "channel": "voice",
            "status": "active",
            "last_active_at": datetime.now(timezone.utc).isoformat(),
        }, on_conflict="session_id").execute()
    except Exception as e:
        logger.warning(f"Session upsert failed: {e}")


# ── Helper: parse date/time strings ──────────────────────────────────────────

def _parse_booking_datetime(date_str: str, time_str: str) -> str:
    """Return ISO UTC string for a Santo Domingo (UTC-4) date+time."""
    import re
    from datetime import datetime, timezone, timedelta

    # Strip day-of-week prefix e.g. "Monday, June 23" -> "June 23"
    date_str = re.sub(r"^[a-zA-Z]+,\s*", "", date_str).strip()

    # Add current year if missing
    if not re.search(r"\d{4}", date_str):
        date_str = f"{date_str}, {datetime.now().year}"

    # Parse time
    m = re.match(r"(\d+):(\d+)\s*(AM|PM)", time_str, re.IGNORECASE)
    if not m:
        raise ValueError(f"Cannot parse time: {time_str!r}")
    h, mins, ampm = int(m.group(1)), int(m.group(2)), m.group(3).upper()
    if ampm == "PM" and h < 12:
        h += 12
    if ampm == "AM" and h == 12:
        h = 0

    date_obj = datetime.strptime(date_str, "%B %d, %Y")
    santo_domingo_offset = timedelta(hours=-4)
    local_dt = datetime(date_obj.year, date_obj.month, date_obj.day, h, mins, 0,
                        tzinfo=timezone(santo_domingo_offset))
    return local_dt.astimezone(timezone.utc).isoformat()


# ── KoolTech Agent class ──────────────────────────────────────────────────────

class KoolTechAgent(Agent):
    """
    Multilingual voice agent for KoolTech Solutions.
    Handles sales, customer service, appointment scheduling, and technical support.
    """

    def __init__(self, agent_name: str, session_id: str) -> None:
        self.agent_name = agent_name
        self.session_id = session_id
        persona = PERSONA_MAP.get(agent_name, DEFAULT_PERSONA)

        system_prompt = f"""You are {agent_name}, the {persona['role']} for KoolTech Solutions — \
a premium Managed Service Provider serving the Dominican Republic, USA, Canada, and the Caribbean.

CORE BEHAVIOURS:
1. Multilingual: Detect the user's language (English or Spanish) and respond in the SAME language throughout.
2. Voice format: You are speaking aloud. No markdown, no bullet points, no numbered lists.
   Keep sentences short and natural. Pause between thoughts with a comma or period.
3. Zero Hallucination: Call get_knowledge BEFORE answering ANY pricing, feature, or SLA question.
   If no data is found, say exactly: "{KNOWLEDGE_FALLBACK}"
4. Booking confirmation: Before calling book_demo, verbally summarise ALL details (name, email, date, time, service)
   and wait for the user to say "yes", "correct", or "confirm".
5. Escalation: If the user asks for a human, says "speak to a real person", expresses frustration twice,
   or reports a critical incident (ransomware, data breach, full outage), call escalate_to_human IMMEDIATELY.
6. One question at a time: Never combine multiple questions in a single response.

SERVICES OVERVIEW (use get_knowledge for specific pricing/SLAs):
{SERVICES_OVERVIEW}

ROLE-SPECIFIC INSTRUCTIONS:
{persona['instructions']}"""

        super().__init__(instructions=system_prompt)
        logger.info(f"[Agent] Persona: {agent_name} | Role: {persona['role']} | Session: {session_id}")

    # ── Tools ─────────────────────────────────────────────────────────────────

    @function_tool()
    async def get_knowledge(self, query: str) -> str:
        """
        Retrieve verified information from the KoolTech knowledge base.
        ALWAYS call this before answering questions about pricing, features, SLAs, or compliance.

        Args:
            query: The specific question or topic to look up.
        """
        import httpx
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{SITE_URL}/api/ai-agents/knowledge",
                    json={"query": query},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    formatted = data.get("formatted", "")
                    if formatted:
                        return formatted
                    return KNOWLEDGE_FALLBACK
                return KNOWLEDGE_FALLBACK
        except Exception as e:
            logger.error(f"get_knowledge error: {e}")
            return KNOWLEDGE_FALLBACK

    @function_tool()
    async def get_available_slots(self, days: int = 7) -> str:
        """
        Get available booking slots for the next N business days.
        Always call this before proposing any date or time to the user.

        Args:
            days: Number of days ahead to check (1–14). Default is 7.
        """
        import httpx
        try:
            days = max(1, min(days, 14))
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{SITE_URL}/api/bookings/slots?days={days}",
                )
                if resp.status_code == 200:
                    data = resp.json()
                    slots = data.get("availableSlots", [])[:6]
                    if not slots:
                        return "No available slots found in that range. Please try a wider date window."
                    tz = data.get("timezone", "AST")
                    slot_list = ", ".join(f"{s['date']} at {s['time']}" for s in slots)
                    return f"Here are available slots ({tz}): {slot_list}."
                return "Availability service is temporarily unavailable. Please try again shortly."
        except Exception as e:
            logger.error(f"get_available_slots error: {e}")
            return "Availability service is temporarily unavailable."

    @function_tool()
    async def book_demo(
        self,
        name: str,
        email: str,
        service: str,
        date: str,
        time: str,
        phone: Optional[str] = None,
        message: Optional[str] = None,
    ) -> str:
        """
        Schedule a live demo or consultation. Only call this AFTER verbally confirming
        all details with the user and receiving explicit confirmation.

        Args:
            name:    Client's full name.
            email:   Client's email address.
            service: Service they are interested in.
            date:    Date for the demo (e.g. "June 23").
            time:    Time for the demo (e.g. "10:00 AM AST").
            phone:   Client's phone number (optional).
            message: Additional notes from the client (optional).
        """
        import httpx
        try:
            payload = {
                "name": name,
                "email": email,
                "service": service or "Live Demo",
                "date": date,
                "time": time,
                "phone": phone,
                "message": message,
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    f"{SITE_URL}/api/bookings",
                    json=payload,
                )
                data = resp.json()
                if resp.status_code == 200 and data.get("success"):
                    booking_id = data.get("bookingId", "")
                    _log_to_supabase(
                        self.session_id, "agent",
                        f"[Booking confirmed: {name} | {date} at {time} | {email}]",
                        self.agent_name
                    )
                    return (
                        f"You're all set! Your demo is confirmed for {date} at {time}. "
                        f"A confirmation email is on its way to {email} right now. "
                        f"Your booking reference is {str(booking_id)[:8]}. "
                        "Our team will reach out 15 minutes before your session with the meeting link."
                    )
                return (
                    "I ran into a small issue confirming that slot. "
                    "Let me get someone from our team to reach out directly. "
                    "Could you confirm your best contact email?"
                )
        except Exception as e:
            logger.error(f"book_demo error: {e}")
            return (
                "I was unable to complete the booking due to a technical issue. "
                "Please contact us directly at sales@kooltechsolutions.com to confirm your slot."
            )

    @function_tool()
    async def check_availability(self, date: str) -> str:
        """
        Check whether a specific date has any booked slots.

        Args:
            date: Date to check (e.g. "June 23").
        """
        if not supabase:
            return "Availability check is unavailable right now."
        try:
            result = supabase.table("leads")\
                .select("notes")\
                .ilike("notes", f"%LIVE DEMO SCHEDULED: {date}%")\
                .execute()
            booked = []
            for row in (result.data or []):
                import re
                m = re.search(r"at\s+(.+)$", row.get("notes", ""), re.MULTILINE)
                if m:
                    booked.append(m.group(1).strip())
            if booked:
                return f"The following times are already booked on {date}: {', '.join(booked)}."
            return f"{date} looks open. Let me show you some available slots."
        except Exception as e:
            logger.error(f"check_availability error: {e}")
            return "Unable to check availability right now."

    @function_tool()
    async def create_ticket(self, subject: str, description: str, priority: str = "normal") -> str:
        """
        Create a support ticket for an issue that cannot be resolved immediately.

        Args:
            subject:     Brief one-line summary of the issue.
            description: Detailed description including system, error, scope, and steps tried.
            priority:    Ticket priority — one of: low, normal, high, critical.
        """
        if not supabase:
            return "Ticket creation is temporarily unavailable."
        valid = {"low", "normal", "high", "critical"}
        safe_priority = priority if priority in valid else "normal"
        try:
            result = supabase.table("tickets").insert({
                "subject": subject,
                "description": description,
                "priority": safe_priority,
                "status": "open",
            }).select("id").execute()
            ticket_id = result.data[0]["id"] if result.data else "unknown"
            short_id = str(ticket_id)[:8]
            _log_to_supabase(
                self.session_id, "agent",
                f"[Ticket created: #{short_id} | {safe_priority} | {subject}]",
                self.agent_name
            )
            return (
                f"Ticket created. Your ticket reference is {short_id}, priority {safe_priority}. "
                "Our engineering team will be in touch within the SLA window for this priority."
            )
        except Exception as e:
            logger.error(f"create_ticket error: {e}")
            return "Unable to create the ticket right now. Please email support@kooltechsolutions.com."

    @function_tool()
    async def check_ticket_status(self, ticket_id: str) -> str:
        """
        Check the current status of an existing support ticket.

        Args:
            ticket_id: The ticket ID or reference number provided when the ticket was created.
        """
        if not supabase:
            return "Ticket lookup is temporarily unavailable."
        try:
            result = supabase.table("tickets")\
                .select("status, subject, priority")\
                .eq("id", ticket_id)\
                .execute()
            if result.data:
                t = result.data[0]
                return (
                    f"Ticket \"{t['subject']}\" — Status: {t['status'].upper()}, "
                    f"Priority: {t['priority'].upper()}."
                )
            return f"I could not find a ticket with ID {ticket_id}. Please double-check the reference."
        except Exception as e:
            logger.error(f"check_ticket_status error: {e}")
            return "Unable to retrieve ticket status right now."

    @function_tool()
    async def escalate_to_human(
        self,
        reason: str,
        priority: str,
        summary: str,
        client_name: Optional[str] = None,
        client_email: Optional[str] = None,
    ) -> str:
        """
        Escalate the call to a human agent. Use when the user requests a human,
        reports a critical incident, or expresses frustration twice.

        Args:
            reason:       Clear one-line reason for the escalation.
            priority:     Urgency — one of: low, normal, high, critical.
            summary:      2–4 sentence summary of the conversation so far.
            client_name:  Client's name if collected.
            client_email: Client's email if collected.
        """
        import httpx
        try:
            payload = {
                "sessionId": self.session_id,
                "agentName": self.agent_name,
                "channel": "voice",
                "reason": reason,
                "priority": priority,
                "summary": summary,
                "userContact": {
                    "name": client_name,
                    "email": client_email,
                },
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                await client.post(
                    f"{SITE_URL}/api/ai-agents/escalate",
                    json=payload,
                )
            _log_to_supabase(
                self.session_id, "agent",
                f"[Escalation triggered: {priority} | {reason}]",
                self.agent_name
            )
            return (
                "Done. I've notified our team and sent them the full conversation history. "
                f"They will contact you within the {priority} priority SLA window. "
                "Is there anything else I can document while you wait?"
            )
        except Exception as e:
            logger.error(f"escalate_to_human error: {e}")
            return (
                "I've flagged your request internally. "
                "For urgent matters please call or email support@kooltechsolutions.com directly."
            )


# ── Agent entrypoint ──────────────────────────────────────────────────────────

async def entrypoint(ctx: JobContext):
    """Main LiveKit job entrypoint — called for every new room connection."""
    await ctx.connect()

    room_name = ctx.room.name or "unknown-room"
    session_id = room_name.replace("float-call-", "").replace("secure-room-", "")
    logger.info(f"[Agent] Connected to room: {room_name}")

    # ── Extract persona from participant metadata ──────────────────────────────
    agent_name = "Kira"
    await asyncio.sleep(0.5)  # allow participants to publish metadata
    for participant in ctx.room.remote_participants.values():
        if participant.metadata:
            try:
                meta = json.loads(participant.metadata)
                if meta.get("agentName"):
                    agent_name = meta["agentName"]
                    break
            except json.JSONDecodeError:
                pass

    logger.info(f"[Agent] Persona resolved: {agent_name}")
    _upsert_session(session_id, agent_name)

    # ── Build Gemini Live realtime model ─────────────────────────────────────
    persona = PERSONA_MAP.get(agent_name, DEFAULT_PERSONA)
    voice = persona["voice"]

    model = RealtimeModel(
        model="gemini-2.5-flash-native-audio-preview-12-2025",
        api_key=GOOGLE_API_KEY,
        voice=voice,
        temperature=0.8,
    )

    agent = KoolTechAgent(agent_name=agent_name, session_id=session_id)

    # ── Start session ────────────────────────────────────────────────────────
    session = AgentSession(llm=model)
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(noise_cancellation=True),
    )

    # Trigger initial greeting
    await asyncio.sleep(0.5)
    try:
        await session.generate_reply(
            instructions=(
                f"You are {agent_name}. Greet the visitor warmly in the language they are most likely "
                "to speak based on context, introduce yourself by name and role, and ask an open-ended "
                "question to understand what brings them in today."
            )
        )
        _log_to_supabase(session_id, "agent", "[Voice session started]", agent_name)
    except Exception as e:
        logger.error(f"[Agent] Initial greeting failed: {e}")


# ── Worker bootstrap ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="kooltech-workforce",
        )
    )
