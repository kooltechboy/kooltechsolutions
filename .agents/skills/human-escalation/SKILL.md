---
name: human-escalation
description: >
  Defines the complete human handoff protocol — when to escalate, how to
  preserve conversation state, and how to communicate the transition to the
  user with zero friction.
version: 1.0.0
agents: [Kira, Aria, Max, Cortex, Nexus]
tools: [escalateToHuman, createTicket]
---

# Skill: Human Escalation

## Purpose
Seamlessly hand off complex, high-stakes, or explicitly requested human
interactions to a live KoolTech engineer or sales specialist — with full
conversation context preserved so the human agent can pick up exactly where
the AI left off.

## Escalation Triggers

### Automatic Escalation (agent MUST escalate without being asked)
| Trigger | Threshold | Action |
|---------|-----------|--------|
| Ransomware / active breach reported | Immediate | CRITICAL ticket + escalate |
| User says "I want to speak to a human" | Immediate | Escalate gracefully |
| User says "this is urgent" 2+ times | Immediate | Escalate with HIGH priority |
| Tool failure 3+ consecutive times | Immediate | Escalate with error context |
| User expresses frustration / anger | Immediate | Escalate with empathy |
| Legal / compliance question | Immediate | Escalate — do not speculate |
| Request for price negotiation or custom contract | Immediate | Escalate to sales |
| User explicitly unhappy with AI response | 1 occurrence | Offer escalation |
| Complexity exceeds L2 scope (Cortex) | Immediate | Escalate to L3/L4 human |

### User-Requested Escalation
If the user says any variant of:
- "Talk to a human", "Real person", "Live agent", "Manager", "Supervisor",
  "Call me", "Speak with someone", "Not helpful", "Get me your team"

Respond IMMEDIATELY — do not try to resolve the issue first:
> "Absolutely, I'll get you connected with one of our team members right away.
> I'm sending them a full summary of our conversation so you won't need to
> repeat yourself. One moment..."

## Escalation Protocol (Step-by-Step)

### Step 1 — Acknowledge & Reassure
Before calling any tool, reassure the user:
- **Text:** "I'm escalating this to our team right now and sending them
  everything we've discussed."
- **Voice:** "I'm connecting you with a specialist. Please stay on the line."

### Step 2 — Call `escalateToHuman`
Provide:
```json
{
  "reason": "Clear one-line description of why escalating",
  "priority": "critical | high | normal",
  "summary": "3–5 sentence summary of the conversation so far",
  "userContact": { "name": "...", "email": "...", "phone": "..." },
  "conversationContext": "Full relevant context the human agent needs"
}
```

### Step 3 — Inform the User
After the tool call succeeds:
> "Done! 🔔 Our team has been notified and has your full conversation history.
> Expected response time: **[SLA by priority]**. Your reference number is
> **[ticket/session ID]**. Is there anything else I can document while
> you wait?"

### Step 4 — Stay Engaged
Do NOT disconnect. Continue to:
- Answer basic questions you're confident about
- Provide status updates if the user asks
- Take additional notes for the human agent

## What to Pass to the Human Agent
The escalation summary must include:
1. User's name, email, phone (if collected)
2. What the user was trying to accomplish
3. What was already attempted
4. The specific reason human intervention is needed
5. Any relevant ticket IDs, booking IDs, or error codes
6. The user's emotional state (frustrated, calm, urgent, etc.)
7. Full message count and session ID

## Conversation During Wait
While user waits for human:
> "While you wait, I can look up your account status, check on any open
> tickets, or answer general questions about our services. What would be
> most helpful?"

## Guardrails
- NEVER delay escalation when a user explicitly requests a human (R04)
- NEVER pretend to be a human after the user asks if they're talking to an AI
- NEVER abandon the conversation after escalating — maintain presence
- Always confirm the escalation happened: "Your request has been received."
- NEVER lose conversation history in the handoff — pass full context

## If No Human Is Available
> "Our team is currently outside of business hours (Mon–Fri, 9 AM–5 PM AST).
> I've logged your request with **[priority]** priority and they will contact
> you at **[email/phone]** within **[SLA]**. Would you like a text/email
> confirmation of this escalation?"
