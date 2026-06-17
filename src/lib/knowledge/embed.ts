/**
 * Knowledge Base Seeding Script
 *
 * Chunks and embeds the KoolTech service catalog, FAQ, and policy documents
 * into the Supabase knowledge_chunks table for RAG retrieval.
 *
 * Run with: npx tsx src/lib/knowledge/embed.ts
 *
 * Prerequisites:
 * 1. Supabase pgvector extension enabled
 * 2. knowledge_chunks table created (run supabase/migrations/001_knowledge_base.sql)
 * 3. SUPABASE_SERVICE_ROLE_KEY and GOOGLE_GENERATIVE_AI_API_KEY in .env.local
 */

import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { serviceCatalog } from "../../data/services";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Types ────────────────────────────────────────────────────────────────────

interface RawChunk {
  source: string;
  category: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
}

// ── Chunking Functions ────────────────────────────────────────────────────────

/**
 * Convert the service catalog into embeddable text chunks.
 * Each service becomes its own chunk for precise retrieval.
 */
function chunkServiceCatalog(): RawChunk[] {
  const chunks: RawChunk[] = [];

  for (const category of serviceCatalog) {
    // One chunk per individual service (fine-grained retrieval)
    for (const svc of category.services) {
      const content = [
        `Service: ${svc.name}`,
        `Category: ${category.name}`,
        `SKU Code: ${svc.code}`,
        `Price: ${svc.price} ${svc.priceType === "Monthly" ? "per endpoint per month" : svc.priceType}`,
        `Description: ${svc.description}`,
        svc.priority ? `Priority Tier: ${svc.priority}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      chunks.push({
        source: "service_catalog",
        category: category.name,
        title: svc.name,
        content,
        metadata: {
          code: svc.code,
          price: svc.price,
          priceType: svc.priceType,
          priority: svc.priority ?? "Normal",
        },
      });
    }

    // One summary chunk per category (for broad queries like "what security services do you offer?")
    const categoryContent = [
      `Category: ${category.name}`,
      `Overview: ${category.description}`,
      `Services offered: ${category.services.map((s) => s.name).join(", ")}`,
      `Price range: ${[...new Set(category.services.map((s) => s.price))].join(", ")}`,
    ].join("\n");

    chunks.push({
      source: "service_catalog",
      category: category.name,
      title: `${category.name} — Category Overview`,
      content: categoryContent,
      metadata: { type: "category_summary" },
    });
  }

  return chunks;
}

/**
 * Static FAQ chunks covering common pre-sales questions.
 * These are hand-curated for accuracy and brand voice.
 */
function buildFAQChunks(): RawChunk[] {
  return [
    {
      source: "faq",
      category: "General",
      title: "What is KoolTech Solutions?",
      content:
        "KoolTech Solutions is a premium Managed Service Provider (MSP) specializing in enterprise-grade IT services for businesses in the Dominican Republic, USA, Canada, and the Caribbean. We provide Managed IT, Cybersecurity, Cloud Services, Network Design, VoIP, and AI-powered automation and agents.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Pricing",
      title: "How does KoolTech pricing work?",
      content:
        "KoolTech pricing is primarily per-endpoint per-month for managed services. Entry-level managed IT starts at $25/endpoint/month. Our AI agents (Kira, Max, Nova) have fixed monthly licensing fees. NOC/SOC, Compliance, and enterprise bundles are custom-quoted based on environment size. All prices are in USD.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Onboarding",
      title: "How long does onboarding take?",
      content:
        "Standard onboarding for Managed IT services takes 5–10 business days. This includes agent deployment, monitoring configuration, and handoff training. Cloud migrations and network design projects follow a separate Statement of Work with timelines scoped during discovery.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Support",
      title: "What are KoolTech's support hours?",
      content:
        "KoolTech provides 24/7 automated monitoring and AI-first support via our chat and voice assistants. Human engineers are available Monday–Friday 9 AM–6 PM Atlantic Standard Time (UTC-4). Critical incidents trigger 24/7 human on-call escalation regardless of business hours.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Security",
      title: "What compliance frameworks does KoolTech support?",
      content:
        "KoolTech's Compliance as a Service covers: HIPAA, PCI-DSS, SOC 2 Type II, ISO 27001, CMMC (Cybersecurity Maturity Model Certification), GDPR, and the Dominican Republic Data Privacy Law (Ley 172-13). Specific framework support is confirmed during the compliance assessment phase.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Contracts",
      title: "What are KoolTech's contract terms?",
      content:
        "KoolTech offers month-to-month and annual contract options. Annual contracts receive preferred pricing. There are no long-term lock-ins for standard managed services — 30-day written notice is required for cancellation. Custom development and implementation projects follow a project-based SOW.",
      metadata: {},
    },
    {
      source: "faq",
      category: "Geographic",
      title: "What regions does KoolTech serve?",
      content:
        "KoolTech Solutions serves clients in the Dominican Republic (primary market), United States, Canada, and the broader Caribbean region. Remote services are available globally. On-site services are currently limited to the Dominican Republic and select Caribbean islands.",
      metadata: {},
    },
    {
      source: "faq",
      category: "AI Assistants",
      title: "What are KoolTech's AI Assistants?",
      content:
        "KoolTech offers custom AI assistants for business automation: Kira (AI Receptionist, $129/mo) handles inbound calls, lead qualification, and callbacks; Max (AI Support Pro, $149/mo) manages ticket resolution and knowledge base search; Nova (AI Sales Development, $189/mo) handles outbound lead generation and follow-ups. Custom AI assistants are also available starting at $149/mo for hosting.",
      metadata: {},
    },
  ];
}

/**
 * Policy document chunks.
 */
function buildPolicyChunks(): RawChunk[] {
  return [
    {
      source: "policy",
      category: "SLA",
      title: "Service Level Agreement — Response Times",
      content:
        "Critical (system down): 15-minute response, 4-hour resolution target. High (major impact): 1-hour response, 8-hour resolution. Normal (limited impact): 4-hour response, next business day resolution. Low (cosmetic/minor): 24-hour response, 3-business-day resolution. SLAs apply during business hours for Normal/Low priority. Critical and High tickets trigger 24/7 on-call.",
      metadata: { type: "sla" },
    },
    {
      source: "policy",
      category: "Data",
      title: "Data Privacy and Security Policy",
      content:
        "KoolTech Solutions is compliant with the Dominican Republic's Ley 172-13 data protection law and GDPR for EU-facing clients. Customer data is encrypted at rest (AES-256) and in transit (TLS 1.3). No client data is ever sold or shared with third parties. Data residency options are available for regulated industries.",
      metadata: { type: "privacy" },
    },
  ];
}

// ── Embedding & Insertion ────────────────────────────────────────────────────

const BATCH_SIZE = 20; // Google gemini-embedding-2 batch limit

async function embedAndInsertChunks(chunks: RawChunk[]): Promise<void> {
  console.log(`\nEmbedding ${chunks.length} chunks in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.content);

    console.log(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}...`
    );

    try {
      const { embeddings } = await embedMany({
        model: google.textEmbeddingModel("gemini-embedding-2"),
        values: texts,
        providerOptions: {
          google: {
            outputDimensionality: 768,
          },
        },
      });

      // Prepare rows for upsert
      const rows = batch.map((chunk, idx) => ({
        source: chunk.source,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
      }));

      const { error } = await supabase
        .from("knowledge_chunks")
        .upsert(rows, { onConflict: "title,source" });

      if (error) {
        console.error(`  ❌ Batch insert error:`, error.message);
      } else {
        console.log(`  ✅ Inserted ${rows.length} chunks`);
      }
    } catch (err) {
      console.error(`  ❌ Embedding error:`, err);
    }

    // Rate limit: 200ms between batches
    await new Promise((r) => setTimeout(r, 200));
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🧠 KoolTech Knowledge Base Seeding Script");
  console.log("==========================================\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌ Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    process.exit(1);
  }

  const catalogChunks = chunkServiceCatalog();
  const faqChunks = buildFAQChunks();
  const policyChunks = buildPolicyChunks();

  const allChunks = [...catalogChunks, ...faqChunks, ...policyChunks];

  console.log(`📦 Total chunks to embed: ${allChunks.length}`);
  console.log(`   - Service catalog: ${catalogChunks.length}`);
  console.log(`   - FAQ: ${faqChunks.length}`);
  console.log(`   - Policy: ${policyChunks.length}`);

  await embedAndInsertChunks(allChunks);

  console.log("\n✅ Knowledge base seeding complete!");
  console.log("   Agents can now retrieve grounded context from Supabase pgvector.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
