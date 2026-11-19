---
name: client-onboarding-automation
description: "Automates new client tenant onboarding, provisioning infrastructure accounts, generating client portal credentials, configuring SLA monitoring, and dispatching the technical welcome kit."
version: 1.0.0
agents: [Kira, Nexus]
tools: [createClient, provisionAssets, sendWelcomeKit]
---

# Skill: Client Onboarding Automation

## Purpose
Executes the standardized 5-stage enterprise client onboarding protocol for KoolTech Solutions. Transforms a signed proposal into a fully operational, monitored client environment within 24 hours.

## Onboarding Stage Checklist

### Stage 1: Identity & Tenant Provisioning
1. Generate unique client UUID and create tenant record in Supabase `profiles` with role `client`.
2. Configure tenant access control, multi-factor authentication requirements, and authorized IP ranges.
3. Establish dedicated credential encryption key in KMS for credential storage.

### Stage 2: Native PSA & Asset Inventory Ingestion
1. Parse client discovery sheet or CSV export into `client_assets` table.
2. Tag all endpoints (Servers, Firewalls, Laptops, Switches, Cloud Instances) with unique asset tags (e.g. `SRV-001`, `FW-001`).
3. Record hardware serial numbers, static IP assignments, and warranty expiration dates.

### Stage 3: Proactive Telemetry & SLA Configuration
1. Register client infrastructure nodes in `infrastructure_nodes` monitoring table.
2. Bind contract SLA rules:
   - Critical (Sev 1): < 15 minute emergency response
   - High (Sev 2): < 1 hour incident response
   - Normal (Sev 3): < 4 hour resolution target
3. Connect automated incident triage webhooks to on-call Discord/Slack alert channels.

### Stage 4: AI Support Assistant Customization
1. Seed the client's vector knowledge base with:
   - Client network architecture diagram and topology notes
   - Approved vendor support contacts and ISP circuits
   - Custom escalation matrices and change management authorization policies.
2. Enable Kira Support Assistant in `/portal/ai-assistant` with tailored tenant context.

### Stage 5: Welcome Dispatch & Executive Handoff
1. Send automated bilingual (EN/ES) Welcome Kit via Resend:
   - Client Portal login link (`/login`)
   - 24/7 Emergency Dispatch phone numbers
   - SLA commitment document and assigned Principal Engineer contact.
2. Create kickoff calendar invite for the 30-day technical architecture review.
