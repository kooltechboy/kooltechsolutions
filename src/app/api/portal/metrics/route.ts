import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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

    const now = new Date();
    // Build actual last 6 months dynamic labels
    const dynamicMonths: string[] = [];
    const dynamicCounts: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      dynamicMonths.push(monthLabel);
      
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
      
      const { data: adminMsgs } = await supabase
        .from("ticket_messages")
        .select("ticket_id, created_at, sender:sender_id(role)")
        .in("ticket_id", ticketIds);

      if (adminMsgs && adminMsgs.length > 0) {
        let totalDiffMins = 0;
        let responseCount = 0;

        tickets.forEach(ticket => {
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

    // ── 2. Native Infrastructure & Security Metrics ──
    const [nodesRes, blockedEventsRes, devicesRes] = await Promise.all([
      supabase.from("infrastructure_nodes").select("*"),
      supabase.from("security_events").select("id").eq("status", "Blocked"),
      supabase.from("devices").select("*"),
    ]);

    const nodes = nodesRes.data || [];
    const threatsBlocked = blockedEventsRes.data ? blockedEventsRes.data.length : 0;
    const devices = devicesRes.data || [];

    // Compute Health Score from native assets & nodes
    let clientAssetsCount = devices.length + nodes.length;
    let healthyAssetsCount = devices.filter(d => d.status === "online").length + 
                             nodes.filter(n => n.status === "Online").length;

    if (clientAssetsCount === 0) {
      clientAssetsCount = 10;
      healthyAssetsCount = 10;
    }

    const healthScore = Math.min(100, Math.round((healthyAssetsCount / clientAssetsCount) * 100));

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

    // SLA recent milestones: map unresolved tickets or high severity events
    const milestones = tickets 
      ? tickets.slice(0, 5).map((t) => ({
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
        nodes: nodes.map(n => n.name),
        nodeUptimes: nodes.map(n => parseFloat(n.uptime.replace("%", "")) || 99.99)
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
