/**
 * Knowledge Catalog Serializer
 * Converts the service catalog into a compact, token-budgeted string
 * suitable for injection into the LLM system prompt.
 *
 * This is the FIRST line of defense against price/feature hallucination.
 * Until the full RAG pipeline is live, this ensures every agent has
 * accurate service data in-context at all times.
 */

import { serviceCatalog, type ServiceCategory } from "../../data/services";

// ── Token budget constants ────────────────────────────────────────────────────
// Full catalog is ~10KB. We compress it to stay within context limits.
const MAX_CATALOG_CHARS = 6000;

// ── Agent → relevant category mapping ────────────────────────────────────────
const AGENT_CATEGORY_MAP: Record<string, string[]> = {
  Kira: [
    "Managed IT & Security Bundles",
    "AI as a Service (AIaaS) & Digital Web",
    "Secure Cloud Communications",
    "Cloud Licensing & SaaS",
  ],
  Aria: [
    "Managed IT & Security Bundles",
    "AI as a Service (AIaaS) & Digital Web",
    "Add-On Managed Services",
    "Cloud Licensing & SaaS",
  ],
  Max: [
    "Managed IT & Security Bundles",
    "Add-On Managed Services",
    "NOC as a Service",
    "SOC as a Service",
    "Compliance as a Service",
    "AI as a Service (AIaaS) & Digital Web",
  ],
  Cortex: [
    "Managed IT & Security Bundles",
    "Add-On Managed Services",
    "NOC as a Service",
    "SOC as a Service",
  ],
  Nexus: [
    "Managed IT & Security Bundles",
    "AI as a Service (AIaaS) & Digital Web",
    "Cloud Licensing & SaaS",
    "Secure Cloud Communications",
  ],
};

/**
 * Serialize a single service to a compact single-line string.
 * Format: "• [CODE] Name — Price/priceType | Description"
 */
function serializeService(svc: ServiceCategory["services"][number]): string {
  const price =
    svc.price === "Custom"
      ? "Custom pricing"
      : `${svc.price}/${svc.priceType}`;
  // Truncate long descriptions to 120 chars to save tokens
  const desc =
    svc.description.length > 120
      ? svc.description.slice(0, 117) + "..."
      : svc.description;
  return `  • [${svc.code}] ${svc.name} — ${price}\n    ${desc}`;
}

/**
 * Build a compact, agent-relevant knowledge context string
 * to inject into the system prompt.
 *
 * @param agentName - The persona name to filter categories for
 * @param includeAll - Override to include all categories (e.g. for admin agents)
 */
export function buildCatalogContext(
  agentName?: string,
  includeAll = false
): string {
  const relevantCategories =
    !includeAll && agentName && AGENT_CATEGORY_MAP[agentName]
      ? AGENT_CATEGORY_MAP[agentName]
      : null;

  const lines: string[] = [
    "## KOOLTECH SOLUTIONS — OFFICIAL SERVICE CATALOG",
    "Use ONLY these verified services and prices when responding to client inquiries.",
    "Never quote prices not listed below. If a service is not listed, say you'll check with the team.",
    "",
  ];

  let charCount = lines.join("\n").length;

  for (const category of serviceCatalog) {
    // Filter categories by agent relevance
    if (
      relevantCategories &&
      !relevantCategories.includes(category.name)
    ) {
      continue;
    }

    const categoryHeader = `\n### ${category.name}\n${category.description}`;
    const serviceLines = category.services.map(serializeService);
    const block = categoryHeader + "\n" + serviceLines.join("\n");

    // Enforce token budget — stop adding if we'd exceed limit
    if (charCount + block.length > MAX_CATALOG_CHARS) {
      lines.push("\n[Additional service categories available — ask for details]");
      break;
    }

    lines.push(block);
    charCount += block.length;
  }

  lines.push(
    "",
    "## PRICING POLICY",
    "- All prices are per-endpoint per-month unless otherwise stated.",
    "- 'Custom' pricing requires a discovery call to scope correctly.",
    "- Minimum contract terms and volume discounts are available — refer to sales team.",
    "- Prices shown are in USD.",
  );

  return lines.join("\n");
}

/**
 * Returns a very short (< 500 char) services overview for voice agents
 * where token budgets are even tighter.
 */
export function buildVoiceCatalogSummary(agentName?: string): string {
  const relevantCategories =
    agentName && AGENT_CATEGORY_MAP[agentName]
      ? AGENT_CATEGORY_MAP[agentName]
      : null;

  const summaries: string[] = [];
  for (const category of serviceCatalog) {
    if (relevantCategories && !relevantCategories.includes(category.name)) {
      continue;
    }
    const names = category.services.map((s) => s.name).join(", ");
    summaries.push(`${category.name}: ${names}`);
    if (summaries.join(". ").length > 400) break;
  }

  return (
    "KoolTech core services include: " +
    summaries.join(" | ") +
    ". Always retrieve specific pricing before quoting."
  );
}
