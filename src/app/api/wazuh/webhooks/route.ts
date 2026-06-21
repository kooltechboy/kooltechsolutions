import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Validate the webhook secret so only Wazuh can trigger ticket creation
    const authHeader = request.headers.get("Authorization");
    const webhookSecret = process.env.WAZUH_WEBHOOK_SECRET;
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      console.warn("Wazuh webhook: unauthorized request rejected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();

    // Extract Wazuh alert fields
    const ruleLevel: number = payload?.rule?.level ?? 0;
    const ruleId: string = payload?.rule?.id ?? "unknown";
    const description: string = payload?.rule?.description ?? "Wazuh Security Alert";
    const agentName: string = payload?.agent?.name ?? "Unknown Agent";
    const agentIp: string = payload?.agent?.ip ?? "N/A";
    const fullLog: string = payload?.full_log ?? "No log details provided.";
    const timestamp: string = payload?.timestamp ?? new Date().toISOString();
    const mitre = payload?.rule?.mitre;
    const mitreInfo = mitre
      ? `\n\nMITRE ATT&CK:\n  Tactics: ${(mitre.tactic ?? []).join(", ")}\n  Techniques: ${(mitre.id ?? []).join(", ")}`
      : "";

    // Only create tickets for high/critical severity (rule level >= 10)
    if (ruleLevel >= 10) {
      const priority = ruleLevel >= 14 ? "critical" : "high";
      const ticketDescription = [
        `**Wazuh Security Alert — Level ${ruleLevel} (Rule ID: ${ruleId})**`,
        `Triggered at: ${new Date(timestamp).toLocaleString()}`,
        `Agent: ${agentName} (${agentIp})`,
        ``,
        `**Description:**`,
        description,
        mitreInfo,
        ``,
        `**Raw Log:**`,
        `\`\`\``,
        fullLog,
        `\`\`\``,
      ].join("\n");

      const supabase = await createClient();
      const { error } = await supabase.from("tickets").insert({
        subject: `[WAZUH L${ruleLevel}] ${agentName}: ${description.slice(0, 100)}`,
        description: ticketDescription,
        status: "open",
        priority,
      });

      if (error) {
        console.error("Failed to create ticket from Wazuh webhook:", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
      }

      console.log(`[Wazuh Webhook] Created ${priority} ticket for alert L${ruleLevel} on ${agentName}`);
    } else {
      console.log(`[Wazuh Webhook] Ignored alert Level ${ruleLevel} on ${agentName} — below threshold.`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error processing webhook";
    console.error("Wazuh Webhook Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

