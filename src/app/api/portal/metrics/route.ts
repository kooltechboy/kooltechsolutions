import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient } from "@/lib/itflow";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile to get company name and role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_name")
      .eq("id", user.id)
      .single();

    // ── 1. Fetch tickets to calculate Support Velocity & Average Response Time ──
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, subject, priority, status, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    // Group tickets by month for the last 6 months
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
    const ticketCounts = [0, 0, 0, 0, 0, 0, 0];
    
    const now = new Date();
    // Build actual last 6 months dynamic labels
    const dynamicMonths: string[] = [];
    const dynamicCounts: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      dynamicMonths.push(monthLabel);
      
      // Count tickets created in this month/year
      let count = 0;
      if (tickets) {
        count = tickets.filter(t => {
          const tc = new Date(t.created_at);
          return tc.getMonth() === d.getMonth() && tc.getFullYear() === d.getFullYear();
        }).length;
      }
      dynamicCounts.push(count);
    }

    // Calculate Average Response Time
    let avgResponseMins: number | null = null;
    if (tickets && tickets.length > 0) {
      const ticketIds = tickets.map(t => t.id);
      
      // Get all messages for these tickets that were sent by admins
      const { data: adminMsgs } = await supabase
        .from("ticket_messages")
        .select("ticket_id, created_at, sender:sender_id(role)")
        .in("ticket_id", ticketIds);

      if (adminMsgs && adminMsgs.length > 0) {
        let totalDiffMins = 0;
        let responseCount = 0;

        tickets.forEach(ticket => {
          // Find first message from an admin for this ticket
          const firstAdminMsg = adminMsgs
            .filter(m => m.ticket_id === ticket.id && (m.sender as any)?.role === "admin")
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

          if (firstAdminMsg) {
            const diffMs = new Date(firstAdminMsg.created_at).getTime() - new Date(ticket.created_at).getTime();
            totalDiffMins += Math.max(1, Math.round(diffMs / 60000));
            responseCount++;
          }
        });

        if (responseCount > 0) {
          avgResponseMins = Math.round(totalDiffMins / responseCount);
        }
      }
    }

    // ── 2. Query Database and Integrations for Real Metrics ──
    
    // Fetch live infrastructure nodes to compute health score, node uptime, and node SLA matrix
    const { data: nodes } = await supabase
      .from("infrastructure_nodes")
      .select("*");

    // Fetch security events to get actual count of blocked events
    const { data: blockedEvents } = await supabase
      .from("security_events")
      .select("id")
      .eq("status", "Blocked");

    const threatsBlocked = blockedEvents ? blockedEvents.length : 0;

    let clientAssetsCount = 0;
    let healthyAssetsCount = 0;
    let hasITFlowAssets = false;

    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "ITFlow")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";
    const isConnected = dbConfig?.status === "Connected" || !!process.env.ITFLOW_API_KEY;

    if (isConnected && apiKey && apiUrl && profile) {
      try {
        const itflowClient = new ITFlowClient({ apiUrl, apiKey });
        const itflowAssets = await itflowClient.getItems<any>("assets");

        if (itflowAssets && itflowAssets.data && Array.isArray(itflowAssets.data)) {
          const clientCompany = (profile.company_name || "").toLowerCase().trim();
          const clientAssets = itflowAssets.data.filter((item: any) => {
            const clientName = (item.client_name || "").toLowerCase().trim();
            return (
              clientCompany !== "" &&
              (clientName === clientCompany ||
                clientName.includes(clientCompany) ||
                clientCompany.includes(clientName))
            );
          });

          if (clientAssets.length > 0) {
            clientAssetsCount = clientAssets.length;
            healthyAssetsCount = clientAssetsCount; // default
            hasITFlowAssets = true;

            // Match with Wazuh to get active agent status
            const wazuhRes = await fetch(`${request.url.split("/api/")[0]}/api/wazuh`, {
              headers: {
                cookie: request.headers.get("cookie") || ""
              }
            });
            if (wazuhRes.ok) {
              const wazuhData = await wazuhRes.json();
              if (wazuhData && Array.isArray(wazuhData.agents)) {
                const wazuhAgentsList = wazuhData.agents;
                healthyAssetsCount = wazuhAgentsList.filter((a: any) => a.status === "active").length;
              }
            }
          }
        }
      } catch (itflowErr) {
        console.error("Failed to query ITFlow assets in metrics route:", itflowErr);
      }
    }

    // Fall back to infrastructure_nodes if ITFlow is disconnected or returns no assets
    if (!hasITFlowAssets && nodes && nodes.length > 0) {
      clientAssetsCount = nodes.length;
      healthyAssetsCount = nodes.filter(n => n.status === "Online").length;
    }

    const healthScore = clientAssetsCount > 0 
      ? Math.round((healthyAssetsCount / clientAssetsCount) * 100)
      : 100;

    // Calculate Uptime (average uptime of all infrastructure nodes)
    let avgUptimeVal = 99.99;
    if (nodes && nodes.length > 0) {
      const uptimes = nodes
        .map(n => parseFloat(n.uptime.replace("%", "")))
        .filter(u => !isNaN(u));
      if (uptimes.length > 0) {
        avgUptimeVal = uptimes.reduce((sum, u) => sum + u, 0) / uptimes.length;
      }
    }
    const uptimeStr = `${avgUptimeVal.toFixed(2)}%`;

    // SLA recent milestones (incidents): map unresolved tickets or high severity events
    const milestones = tickets 
      ? tickets.slice(0, 5).map((t, idx) => ({
          id: `INC-${t.id.slice(0, 4).toUpperCase()}`,
          subj: t.subject,
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          response: avgResponseMins !== null ? `${avgResponseMins}m` : "N/A",
          resolution: t.status === "resolved" || t.status === "closed" ? "Resolved" : "Active",
          met: true
        }))
      : [];

    return NextResponse.json({
      healthScore,
      uptime: uptimeStr,
      kpis: {
        uptime: uptimeStr,
        avgResponse: avgResponseMins !== null ? `${avgResponseMins}m` : "N/A",
        automation: tickets && tickets.length > 0
          ? `${Math.round((tickets.filter(t => t.status === "resolved").length / tickets.length) * 100)}%`
          : "N/A",
        threatsBlocked: threatsBlocked.toString()
      },
      charts: {
        months: dynamicMonths,
        ticketData: dynamicCounts,
        nodes: nodes ? nodes.map(n => n.name) : [],
        nodeUptimes: nodes ? nodes.map(n => parseFloat(n.uptime.replace("%", "")) || 99.99) : []
      },
      milestones
    });

  } catch (err) {
    console.error("Metrics API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
