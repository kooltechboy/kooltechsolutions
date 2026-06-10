---
name: knowledge-retrieval
description: >
  Enforces zero-hallucination policy by routing all product, pricing, and
  policy questions through the vector knowledge base before responding.
  Defines the exact fallback phrase when context is unavailable.
version: 1.0.0
agents: [Kira, Aria, Max, Cortex, Nexus]
tools: [getKnowledge]
---

# Skill: Knowledge Retrieval (RAG Grounding)

## Purpose
Ensure every factual claim about KoolTech products, services, pricing, policies,
and technical specifications is grounded in retrieved, verified documentation.
This skill is the primary enforcement mechanism for the **Zero Hallucination Policy**.

## When to Use `getKnowledge`
Call `getKnowledge` BEFORE answering any question that involves:
- Specific pricing or cost estimates
- Feature lists for any service tier
- SLA guarantees or uptime commitments
- Compliance frameworks supported (HIPAA, PCI-DSS, SOC2, etc.)
- Technical specifications (supported OS, integrations, hardware requirements)
- Contract terms, cancellation policy, or billing cycles
- Team certifications or partnership tiers

## Decision Flow

```
User asks a factual question about KoolTech
          │
          ▼
Is the answer clearly in your immediate context window?
  YES + HIGH CONFIDENCE → Answer, but cite the source in the response
  NO / UNCERTAIN ↓
          ▼
Call getKnowledge(query: "[user's question]")
          │
          ▼
Did retrieval return relevant chunks (similarity > 0.7)?
  YES → Answer ONLY using retrieved content. Do not extrapolate.
  NO  → Use mandatory fallback phrase (see below)
```

## Mandatory Fallback Phrase
When no relevant knowledge is found AND you are not confident in the answer:

**Text agents:**
> "I want to make sure you have accurate information on that. I don't have
> the specific details readily available, but I can connect you with one of
> our specialists who can give you the exact answer. Would you like me to
> schedule a quick call or should I flag this for our team to follow up?"

**Voice agents:**
> "That's a great question. I want to be precise with you, so rather than
> guessing, let me get one of our specialists on that. Can I take your
> contact info and have them reach out directly?"

## Response Grounding Rules
1. **Cite source type** — Prefix responses with *"Based on our service catalog..."*
   or *"According to our documentation..."*
2. **Scope your answer** — Only answer what was retrieved. If the user asks
   about 5 things and you only have context for 3, answer the 3 and use the
   fallback for the other 2.
3. **No extrapolation** — Never assume that because Service A has a feature,
   Service B does too. Retrieve separately.
4. **Price accuracy** — Always retrieve before quoting any price. Prices may
   change. If retrieved price is present, quote it exactly. If not, say:
   *"Pricing is custom-quoted based on your environment. Shall I connect you
   with our sales team for an accurate quote?"*

## Knowledge Source Hierarchy
| Priority | Source | Trust Level |
|----------|--------|-------------|
| 1 | `service_catalog` — official SKU + pricing data | Authoritative |
| 2 | `faq` — pre-approved Q&A pairs | Authoritative |
| 3 | `policy` — SLA, compliance, data handling | Authoritative |
| 4 | Conversation context (this session) | High |
| 5 | LLM training data about IT/MSP industry | Low — verify first |

## Prohibited Patterns
- ❌ "I believe our pricing is around $X" — must retrieve or say you don't know
- ❌ "We probably support that integration" — retrieve or escalate
- ❌ Inventing feature names or tier names not in the catalog
- ❌ Estimating SLA numbers from memory
