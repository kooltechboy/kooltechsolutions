---
name: infrastructure-audit-playbook
description: "Executes end-to-end technical infrastructure and zero-trust cybersecurity audits, producing structured executive risk assessments, gap analysis reports, and prioritized remediation matrices."
version: 1.0.0
agents: [Max, Kira]
tools: [scanNetwork, analyzeTopology, generateAuditReport]
---

# Skill: Infrastructure & Zero-Trust Audit Playbook

## Purpose
Standardizes technical discovery and security audits for enterprise prospective clients. Replaces ad-hoc reviews with a repeatable 6-pillar assessment methodology.

## 6-Pillar Audit Methodology

### 1. Identity & Access Governance (IAM)
- Multi-factor authentication (MFA) enforcement across all cloud and on-premise accounts.
- Privilege access management (PAM) and stale account deprovisioning audit.
- Verification of Single Sign-On (SSO) integration across SaaS applications.

### 2. Perimeter & Network Topology
- Ingress/egress port scan of all public IP blocks and external firewall interfaces.
- Evaluation of VPN configurations and replacement roadmap with Zero-Trust Network Access (ZTNA).
- Verification of guest Wi-Fi segregation and Layer-2 switch VLAN isolation.

### 3. Endpoint Hygiene & Patch Cadence
- Verification of automated OS and third-party software patching schedules.
- Endpoint Detection & Response (EDR) coverage across all active workstations and servers.
- Local administrator right restriction and USB storage policy enforcement.

### 4. Cloud Architecture & FinOps Efficiency
- Multi-cloud configuration review (AWS, Azure, GCP) against CIS Benchmarks.
- Identification of idle, over-provisioned, or unattached cloud storage volumes.
- Verification of backup immutability and cross-region disaster recovery replication.

### 5. Data Protection & Encryption at Rest
- Verification of full-disk encryption (BitLocker / FileVault) on all mobile laptops.
- Database encryption at rest and TLS 1.3 enforcement in transit.
- Data Loss Prevention (DLP) controls on email gateways and cloud file repositories.

### 6. Compliance Alignment & Evidence Readiness
- Mapping audit findings to SOC 2 Type II, ISO 27001, HIPAA Security Rule, and PCI-DSS.
- Calculation of technical debt score (0–100) and annualized breach risk exposure.

## Deliverable Generation
All audit findings are formatted into an executive PDF report and interactive portal artifact including:
1. Executive Risk Scorecard with traffic-light status indicators (Critical, High, Medium, Low).
2. 30-60-90 Day Remediation Roadmap with estimated engineering hours.
3. Cost-benefit projection contrasting prospective breach fallout against KoolTech managed retainer.
