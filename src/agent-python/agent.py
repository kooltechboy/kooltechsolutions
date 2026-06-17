import os
import logging
import json
import aiohttp
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import JobContext, WorkerOptions, cli, llm, AgentSession
from livekit.plugins import google

# Load environment variables
load_dotenv(dotenv_path=".env.local")

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("kooltech-voice-agent")

class KoolTechToolContext:
    def __init__(self, session_id: str, agent_name: str, user_context: dict = None):
        self.session_id = session_id
        self.agent_name = agent_name
        self.user_context = user_context
        site_url = os.getenv("NEXT_PUBLIC_SITE_URL") or "http://localhost:3000"
        self.gateway_url = f"{site_url}/api/ai-workforce/tools"
        logger.info(f"[Tools] Initialized for session {session_id}, agent {agent_name}, user {user_context}")

    async def _call_gateway(self, tool_name: str, args: dict) -> dict:
        try:
            payload = {
                "toolName": tool_name,
                "arguments": args,
                "sessionId": self.session_id,
                "agentName": self.agent_name,
                "userContext": self.user_context
            }
            logger.info(f"[Tools] Calling gateway {tool_name} with: {json.dumps(args)}")
            async with aiohttp.ClientSession() as session:
                async with session.post(self.gateway_url, json=payload, headers={"Content-Type": "application/json"}) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"[Tools] Gateway {tool_name} response: {json.dumps(data)}")
                        return data
                    else:
                        err_text = await resp.text()
                        logger.error(f"[Tools] Gateway error {resp.status}: {err_text}")
                        return {"error": f"Tool execution failed with status {resp.status}"}
        except Exception as e:
            logger.error(f"[Tools] Exception in calling tool gateway: {e}")
            return {"error": f"Failed to reach tool gateway: {str(e)}"}

    @llm.function_tool
    async def bookDemo(
        self,
        name: str,
        email: str,
        service: str,
        date: str,
        time: str,
        phone: str = None,
        message: str = None
    ) -> str:
        """Schedule a live demo or consultation. ALWAYS confirm details with the user before calling this.

        Args:
            name: Client's full name
            email: Client's email address
            service: Service they are interested in
            date: Date for the demo (e.g. June 15)
            time: Time for the demo (e.g. 10:00 AM)
            phone: Client's phone number
            message: Additional notes
        """
        res = await self._call_gateway("bookDemo", {
            "name": name,
            "email": email,
            "service": service,
            "date": date,
            "time": time,
            "phone": phone,
            "message": message
        })
        if "error" in res:
            return f"Error booking demo: {res['error']}"
        return res.get("message", "Demo booked successfully.")

    @llm.function_tool
    async def getAvailableSlots(self, days: int = 7) -> str:
        """Get available booking slots for the next N days.

        Args:
            days: Number of days ahead to check (1-14)
        """
        res = await self._call_gateway("getAvailableSlots", {"days": days})
        if "error" in res:
            return "Unable to fetch availability right now."
        slots = res.get("slots", [])
        if not slots:
            return "No available slots found in that range."
        slot_list = ", ".join([f"{s['date']} at {s['time']}" for s in slots[:6]])
        return f"Available slots ({res.get('timezone', 'AST')}): {slot_list}"

    @llm.function_tool
    async def checkAvailability(self, date: str) -> str:
        """Check if a specific date has booked slots.

        Args:
            date: Date to check (e.g. 'June 15')
        """
        res = await self._call_gateway("checkAvailability", {"date": date})
        if "error" in res:
            return "Availability service is temporarily unavailable."
        booked = res.get("bookedSlots", [])
        if not booked:
            return f"No booked slots for {date} — this date is open!"
        return f"Booked slots for {date}: {', '.join(booked)}"

    @llm.function_tool
    async def checkTicketStatus(self, ticketId: str) -> str:
        """Check the status of an existing support ticket.

        Args:
            ticketId: The ticket ID
        """
        res = await self._call_gateway("checkTicketStatus", {"ticketId": ticketId})
        if "error" in res or not res.get("success"):
            return "Ticket not found."
        return f"Ticket '{res.get('subject')}' — Status: {res.get('status').upper()}, Priority: {res.get('priority')}."

    @llm.function_tool
    async def createTicket(self, subject: str, description: str, priority: str = "normal") -> str:
        """Create a support ticket for an issue.

        Args:
            subject: Brief summary of the issue
            description: Detailed description of the problem
            priority: Priority: low, normal, high, or critical
        """
        res = await self._call_gateway("createTicket", {
            "subject": subject,
            "description": description,
            "priority": priority
        })
        if "error" in res or not res.get("success"):
            return f"Error creating ticket: {res.get('error', 'Unauthorized')}"
        return res.get("message", "Ticket created successfully.")

    @llm.function_tool
    async def getKnowledge(self, query: str) -> str:
        """Retrieve verified information from the KoolTech knowledge base. Call before answering pricing, features, or SLA questions.

        Args:
            query: The specific question or topic to look up
        """
        res = await self._call_gateway("getKnowledge", {"query": query, "source": "any"})
        if "error" in res or not res.get("found"):
            return "That's a great question and I want to be precise with you. Rather than guessing, let me get one of our specialists on that. Can I take your contact info and have them reach out directly?"
        results = res.get("results", [])
        context = "\n\n".join([f"[Verified Info - {c['title']}]: {c['content']}" for c in results])
        return context

    @llm.function_tool
    async def escalateToHuman(
        self,
        reason: str,
        priority: str = "high",
        summary: str = "",
        clientName: str = None,
        clientEmail: str = None
    ) -> str:
        """Escalate the call to a human agent. Use when user requests human, has a critical issue, or is frustrated.

        Args:
            reason: Clear reason for escalation
            priority: Priority: low, normal, high, critical
            summary: 2-3 sentence summary for the human agent
            clientName: Client's name if known
            clientEmail: Client's email if known
        """
        res = await self._call_gateway("escalateToHuman", {
            "reason": reason,
            "priority": priority,
            "summary": summary,
            "userContact": {
                "name": clientName,
                "email": clientEmail
            }
        })
        if "error" in res or not res.get("success"):
            return "I've flagged your request for our team. Please also reach us directly at support@kooltechsolutions.com if urgent."
        return "I've notified our team and they have your conversation details. A human specialist will contact you shortly. Is there anything else I can help with while you wait?"

async def entrypoint(ctx: JobContext):
    logger.info(f"Agent job starting for room: {ctx.room.name}")
    await ctx.connect()
    logger.info("Connected to room")

    # Resolve agentName and userContext from participant metadata
    agent_name = "Kira"
    user_context = None

    for participant in ctx.room.participants.values():
        if participant.metadata:
            try:
                meta = json.loads(participant.metadata)
                if "agentName" in meta:
                    agent_name = meta["agentName"]
                if "userContext" in meta:
                    user_context = meta["userContext"]
            except Exception as e:
                logger.error(f"Error parsing participant metadata: {e}")

    logger.info(f"Resolved Persona: {agent_name} | User Context: {user_context}")

    # Persona mapping
    persona_map = {
        "Aria": {
            "voice": "Kore",
            "role": "Strategic Coordinator",
            "instructions": "Your ONLY goal is to qualify the visitor and schedule a live demo. Ask ONE question at a time. Gather name, email, phone (optional), and service interest. Always use getAvailableSlots before proposing a time. Confirm all details before calling bookDemo."
        },
        "Cortex": {
            "voice": "Puck",
            "role": "L3 Support Engineer",
            "instructions": "Help users troubleshoot issues. Ask for error codes or symptoms. Be concise. For complex or unresolvable issues, use createTicket. For critical issues (system down, ransomware), call escalateToHuman immediately. Never guess a technical fix if unsure."
        },
        "Max": {
            "voice": "Charon",
            "role": "Senior Solutions Architect",
            "instructions": "Answer complex technical questions about cybersecurity, cloud, networking, and infrastructure. Use getKnowledge before quoting specs. Recommend enterprise solutions. Offer to connect to a human engineer via bookDemo for complex scoping."
        },
        "Nexus": {
            "voice": "Puck",
            "role": "Growth Intelligence",
            "instructions": "Analyze sales velocity and lead quality. Provide growth insights and strategic recommendations for the admin team."
        },
        "Nova": {
            "voice": "Aoede",
            "role": "AI Sales Development",
            "instructions": "Your goal is outbound lead generation, automated prospect engagement, and nurturing interest. Focus on identifying business needs. Reassure the client that our solutions (Kira, Max, and custom agents) can scale their operations. Propose a live demo with the engineering team using getAvailableSlots and bookDemo."
        }
    }

    persona = persona_map.get(agent_name, {
        "voice": "Aoede",
        "role": "Executive Concierge",
        "instructions": "Greet visitors and understand their IT needs. Use getAvailableSlots to show real open times. Confirm all details before booking. Use getKnowledge before answering any pricing or feature questions."
    })

    catalog_summary = "KoolTech core services include: Managed IT & Security, AI as a Service, Secure Cloud Communications, Cloud Licensing & SaaS, NOC & SOC as a Service, and Compliance as a Service. Always use getKnowledge before quoting specific prices."

    system_instruction = f"""You are {agent_name}, the {persona['role']} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.

CORE BEHAVIORS:
1. Multilingual Support: Detect the user's language (English or Spanish) and respond in the same language. If they switch, you switch.
2. Dominican Accent & Dialect: If speaking in Spanish, use a warm, natural, professional Dominican Spanish accent (Español Dominicano). Use natural local pacing. Occasionally use friendly expressions like "Un momentito", "Dime a ver", "Perfecto, entonces..." to sound conversational, but avoid over-exaggeration.
3. Voice format: You are speaking aloud. No markdown, no bullet points, no numbered lists. Keep sentences short and natural. Pause between thoughts.
4. Zero Hallucination: Use getKnowledge before answering pricing, feature, or SLA questions. If no data found, use your fallback response to connect them with a specialist.
5. Tool Confirmation: Before calling bookDemo, verbally confirm all details (name, email, service, date, time) and wait for the user to say "yes" or "confirm".
6. Escalation: If the user asks for a human or expresses frustration, call escalateToHuman immediately.

SERVICES OVERVIEW (for quick reference — always use getKnowledge for specific details):
{catalog_summary}

ROLE-SPECIFIC INSTRUCTIONS:
{persona['instructions']}"""

    model = google.beta.realtime.RealtimeModel(
        model="gemini-2.0-flash-exp",
        voice=persona["voice"],
        temperature=0.8,
        instructions=system_instruction
    )

    session_id = ctx.room.name.replace("room-", "").replace("call-", "")
    fnc_ctx = KoolTechToolContext(
        session_id=session_id,
        agent_name=agent_name,
        user_context=user_context
    )

    tools = llm.find_function_tools(fnc_ctx)

    session = AgentSession(
        llm=model,
        tools=tools
    )

    logger.info("Starting AgentSession")
    await session.start(ctx.room)
    logger.info("Agent started successfully")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, agent_name="kooltech-workforce"))
