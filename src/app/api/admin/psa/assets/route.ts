import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

const assetSchema = z.object({
  client_name: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  asset_tag: z.string().trim().min(1).max(60),
  type: z.enum(["Server", "Firewall", "Laptop", "Desktop", "Switch", "NAS", "Access Point", "Cloud Instance"]),
  model: z.string().trim().max(100).optional(),
  serial: z.string().trim().max(100).optional(),
  ip_address: z.string().trim().max(50).optional(),
  location: z.string().trim().max(120).optional(),
  status: z.enum(["In Use", "Maintenance", "In Repair", "Decommissioned", "Spare"]).default("In Use"),
  assigned_to: z.string().trim().max(120).optional(),
  purchase_date: z.string().optional(),
  warranty_expires: z.string().optional(),
  health_status: z.enum(["healthy", "warning", "critical", "offline"]).default("healthy"),
});

// GET: List all assets by combining devices and infrastructure_nodes
export async function GET(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");
  const statusFilter = searchParams.get("status");

  const adminSupabase = getAdminSupabase();

  try {
    // 1. Check client_assets if present
    const { data: customAssets, error: customErr } = await adminSupabase
      .from("client_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!customErr && customAssets && customAssets.length > 0) {
      let filtered = customAssets;
      if (typeFilter && typeFilter !== "all") filtered = filtered.filter(a => a.type === typeFilter);
      if (statusFilter && statusFilter !== "all") filtered = filtered.filter(a => a.status === statusFilter);
      return NextResponse.json({ data: filtered });
    }

    // 2. Fetch from existing devices with client relationships
    const { data: devices, error: devErr } = await adminSupabase
      .from("devices")
      .select(`
        id,
        hostname,
        os,
        ip_address,
        status,
        cpu_usage,
        memory_usage,
        disk_usage,
        last_seen,
        created_at,
        clients (
          name
        )
      `)
      .order("created_at", { ascending: false });

    // 3. Fetch from existing infrastructure_nodes
    const { data: nodes, error: nodeErr } = await adminSupabase
      .from("infrastructure_nodes")
      .select("*")
      .order("created_at", { ascending: false });

    const normalizedAssets: Array<{
      id: string;
      client_name: string;
      name: string;
      asset_tag: string;
      type: string;
      model?: string;
      serial?: string;
      ip_address?: string;
      location?: string;
      status: string;
      assigned_to?: string;
      purchase_date?: string;
      warranty_expires?: string;
      health_status: string;
      created_at?: string;
    }> = [];

    // Map devices
    if (devices && devices.length > 0) {
      for (const d of devices as any[]) {
        const clientName = d.clients?.name || "Managed Client";
        const healthStatus = d.status === "online" ? "healthy" : d.status === "warning" ? "warning" : "offline";
        const isServer = d.hostname.toLowerCase().startsWith("srv-");
        normalizedAssets.push({
          id: d.id,
          client_name: clientName,
          name: d.hostname.toUpperCase(),
          asset_tag: `TAG-${d.hostname.slice(0, 10).toUpperCase()}`,
          type: isServer ? "Server" : "Desktop",
          model: d.os || "Enterprise OS",
          ip_address: d.ip_address || "DHCP",
          location: "Primary Datacenter",
          status: "In Use",
          assigned_to: "SecOps Team",
          warranty_expires: "2027-12-31",
          health_status: healthStatus,
          created_at: d.created_at,
        });
      }
    }

    // Map infrastructure_nodes
    if (nodes && nodes.length > 0) {
      for (const n of nodes) {
        normalizedAssets.push({
          id: n.id,
          client_name: "KoolTech Infrastructure",
          name: n.name,
          asset_tag: n.node_id,
          type: n.type || "Server",
          model: `Uptime ${n.uptime || "99.99%"}`,
          ip_address: n.ip_address || "Static",
          location: n.location || "Server Room",
          status: n.status === "Online" ? "In Use" : "Maintenance",
          assigned_to: "Platform Ops",
          warranty_expires: "Active SLA",
          health_status: n.status === "Online" ? "healthy" : "warning",
          created_at: n.created_at,
        });
      }
    }

    let finalData = normalizedAssets;
    if (typeFilter && typeFilter !== "all") {
      finalData = finalData.filter(a => a.type === typeFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      finalData = finalData.filter(a => a.status === statusFilter);
    }

    return NextResponse.json({ data: finalData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Add new managed device / node
export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = assetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid asset data", issues: parsed.error.issues }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Try client_assets first
    const { data: assetData, error: assetErr } = await adminSupabase
      .from("client_assets")
      .insert({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!assetErr && assetData) {
      return NextResponse.json({ data: assetData });
    }

    // If client_assets is not yet created, write to infrastructure_nodes
    const { data: nodeData, error: nodeErr } = await adminSupabase
      .from("infrastructure_nodes")
      .insert({
        node_id: parsed.data.asset_tag,
        name: parsed.data.name,
        type: parsed.data.type,
        status: parsed.data.status === "In Use" ? "Online" : "Maintenance",
        uptime: "99.99%",
        ip_address: parsed.data.ip_address || "192.168.1.100",
        location: parsed.data.location || parsed.data.client_name,
      })
      .select()
      .single();

    if (nodeErr) {
      return NextResponse.json({ error: nodeErr.message }, { status: 400 });
    }

    return NextResponse.json({ data: nodeData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
