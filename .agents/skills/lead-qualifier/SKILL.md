---
name: lead-qualifier
description: >
  Qualifies inbound leads using the BANT framework (Budget, Authority, Need,
  Timeline). Determines lead score, routes to appropriate persona, and captures
  structured CRM data for the sales team.
version: 1.0.0
agents: [Kira, Aria]
tools: [bookDemo, getKnowledge]
---

# Skill: Lead Qualifier

## Purpose
Transform casual website visitors into qualified sales opportunities by
uncovering their IT pain points, decision-making authority, timeline, and
budget appetite — then routing them to the appropriate demo or specialist.

## BANT Qualification Framework

### B — Budget
**Goal:** Understand if the prospect has budget authority and rough range.
**Ask (indirectly):**
> "Just to make sure we're showing you the most relevant options — are you
> evaluating this for a single office location or multiple sites?"

**Scoring signals:**
- Mentions specific budget → High intent
- Says "leadership needs to approve" → Medium (nurture)
- "Just exploring" with no budget → Low (qualify further)

### A — Authority
**Goal:** Determine if you're speaking to the decision-maker.
**Ask:**
> "Are you the person who would be working directly with our team, or will
> other stakeholders be involved in the final decision?"

**Routing:**
- Decision maker → Book demo immediately
- Influencer/researcher → Offer resources + book a meeting for the DM

### N — Need
**Goal:** Identify the specific pain point(s).
**Ask:**
> "What's the main challenge you're hoping to solve — is it more around
> security, managing your day-to-day IT, moving to the cloud, or something
> else?"

**Map to service:**
| Pain Point | Primary Service | Persona |
|------------|-----------------|---------|
| Ransomware / hacking fears | Cybersecurity / SOC | Max |
| IT team overwhelmed | Managed IT / HDS | Kira |
| Moving to cloud | Cloud Services | Max |
| Phone system / VoIP | Secure Communications | Kira |
| Need compliance docs | Compliance as a Service | Max |
| Recurring IT costs | MSP Bundles | Aria |

### T — Timeline
**Goal:** Understand urgency to prioritize follow-up.
**Ask:**
> "Is this something you're looking to have in place within the next month,
> or are you more in the research phase right now?"

**Scoring:**
- "ASAP" / "This month" → Hot lead → Book demo today
- "Next quarter" → Warm lead → Book demo + send pricing sheet
- "Just looking" → Cold lead → Offer free assessment

## Qualification Script Flow

```
1. Warm greeting + open-ended pain question (N)
2. Company size / location (helps determine service tier)
3. Authority check (A)
4. Timeline (T)
5. Budget framing — indirect (B)
6. Based on score: route to demo booking or escalate to Max/Aria
```

## Lead Score Thresholds
- **Score 75–100** (Hot): DM + has need + timeline < 30 days → Book demo NOW
- **Score 50–74** (Warm): Has need, longer timeline → Book intro call
- **Score 25–49** (Nurture): Early research → Offer blog/resources + email capture
- **Score 0–24** (Unqualified): Wrong fit or no budget signal → Politely close

## Data to Capture for CRM
Every qualified lead must have:
- First name, last name
- Email address
- Phone / WhatsApp (optional)
- Company name and size (rough estimate)
- Location / timezone
- Primary pain point / service interest
- Timeline (ASAP / 1–3 months / 3–6 months / just exploring)
- Referred by (how did they hear about KoolTech?)
- Lead score (calculated internally)

## Guardrails
- Ask ONE question at a time — never combine multiple questions
- NEVER pressure high-score leads — create urgency through value, not pressure
- If user is clearly not a fit, be honest and kind — do not waste their time
- All captured emails must be confirmed before calling `bookDemo`
