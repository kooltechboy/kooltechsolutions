import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient } from "@/lib/itflow";

const categoryMap: Record<string, { name: string; icon: string; desc: string }> = {
  "36": {
    name: "Managed IT & Security Bundles",
    icon: "Shield",
    desc: "Enterprise-grade IT management and security stacks for modern businesses."
  },
  "37": {
    name: "Add-On Managed Services",
    icon: "PlusSquare",
    desc: "Specialized security and management add-ons to harden your infrastructure."
  },
  "38": {
    name: "SOC & Compliance Consulting",
    icon: "ClipboardCheck",
    desc: "vCISO, penetration testing, compliance audits, and advanced threat containment."
  },
  "39": {
    name: "AI as a Service (AIaaS) & Digital Web",
    icon: "Bot",
    desc: "Custom AI employees, autonomous agents, and high-performance web platforms."
  },
  "40": {
    name: "Secure Cloud Communications",
    icon: "PhoneCall",
    desc: "Enterprise VoIP solutions and unified communications platforms."
  },
  "41": {
    name: "Professional IT Services",
    icon: "Wrench",
    desc: "On-site dispatch, onboarding, emergency response, and custom hourly engineering support."
  },
  "42": {
    name: "Cloud Licensing & SaaS",
    icon: "Cloud",
    desc: "Official licensing and professional administration for M365 and Google Workspace."
  },
  "43": {
    name: "Hardware Procurement",
    icon: "Server",
    desc: "Pre-configured workstations, firewalls, and networking equipment."
  },
  "44": {
    name: "Web Infrastructure & Domain Administration",
    icon: "Globe",
    desc: "SSL procurement, domain renewals, and DNS security management."
  }
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Allow authenticated admins or automated sync via a dedicated secret
    if (authError || !user) {
      const authHeader = request.headers.get("Authorization");
      const syncSecret = process.env.ITFLOW_SYNC_SECRET || process.env.WAZUH_WEBHOOK_SECRET;
      if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "ITFlow")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: "ITFlow not configured" }, { status: 400 });
    }

    const client = new ITFlowClient({ apiUrl, apiKey });

    // 1. Sync Clients (ITFlow Clients -> Supabase profiles & organizations)
    let syncedClients = 0;
    try {
      const itflowClients = await client.getItems<any>('clients');
      if (itflowClients && itflowClients.data && Array.isArray(itflowClients.data)) {
        console.log(`Fetched ${itflowClients.data.length} clients from ITFlow.`);
        
        for (const itfClient of itflowClients.data) {
          await supabase.from("organizations").insert({
            company_name: itfClient.client_name || "Unknown Company",
            phone: itfClient.client_phone || null,
            website: itfClient.client_website || null
          }).select('id').maybeSingle();
          
          syncedClients++;
        }
      }
    } catch (e) {
      console.error("Failed to sync clients", e);
    }

    // 2. Sync Tickets
    let syncedTickets = 0;
    try {
      const itflowTickets = await client.getItems<any>('tickets');
      if (itflowTickets && itflowTickets.data && Array.isArray(itflowTickets.data)) {
        console.log(`Fetched ${itflowTickets.data.length} tickets from ITFlow.`);
        
        for (const itfTicket of itflowTickets.data) {
          await supabase.from("tickets").insert({
            subject: itfTicket.ticket_subject || `Ticket #${itfTicket.ticket_prefix || itfTicket.ticket_id || 'Unknown'}`,
            description: itfTicket.ticket_details || "Synced from ITFlow",
            status: "open", 
            priority: "normal" 
          });
          syncedTickets++;
        }
      }
    } catch (e) {
      console.error("Failed to sync tickets", e);
    }

    // 3. Sync Products (ITFlow Products -> Supabase service_catalog)
    let syncedProducts = 0;
    try {
      const itflowProducts = await client.getItems<any>('products');
      if (itflowProducts && itflowProducts.data && Array.isArray(itflowProducts.data)) {
        console.log(`Fetched ${itflowProducts.data.length} products from ITFlow.`);
        
        for (const p of itflowProducts.data) {
          const catId = String(p.product_category_id);
          const catConfig = categoryMap[catId] || {
            name: "Other Services",
            icon: "HelpCircle",
            desc: "Miscellaneous business technology solutions and hardware."
          };

          // Format price (e.g., "$50" or "Custom")
          let formattedPrice = "Custom";
          const priceVal = parseFloat(p.product_price);
          if (!isNaN(priceVal) && priceVal > 0) {
            formattedPrice = `$${priceVal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
          } else if (priceVal === 0) {
            formattedPrice = "Custom";
          }

          // Map price_type
          let priceType = "Monthly";
          const nameLower = (p.product_name || "").toLowerCase();
          const descLower = (p.product_description || "").toLowerCase();
          if (p.product_code?.endsWith("-P") || nameLower.includes("one-time") || descLower.includes("one-time") || nameLower.includes("implementation")) {
            priceType = "One-time";
          } else if (p.product_code?.endsWith("-A") || nameLower.includes("annual") || descLower.includes("annual")) {
            priceType = "Annual";
          } else if (nameLower.includes("hourly") || nameLower.includes("labor") || nameLower.includes("support")) {
            priceType = "Ad Hoc";
          }

          const priority = (nameLower.includes("tier 1") || nameLower.includes("essential") || nameLower.includes("emergency") || nameLower.includes("critical")) ? "High" : "Normal";

          await supabase.from("service_catalog").upsert({
            code: p.product_code || `SKU-${p.product_id}`,
            name: p.product_name || "Unnamed Service",
            description: p.product_description || "",
            price: formattedPrice,
            price_type: priceType,
            category: catConfig.name,
            category_icon: catConfig.icon,
            category_description: catConfig.desc,
            priority: priority,
            active: p.product_archived_at ? false : true
          }, { onConflict: 'code' });

          syncedProducts++;
        }
      }
    } catch (e) {
      console.error("Failed to sync products", e);
    }

    // Update the last_sync timestamp
    await supabase
      .from("integration_configs")
      .update({ last_sync: new Date().toISOString(), status: 'Connected' })
      .eq("name", "ITFlow");

    return NextResponse.json({
      success: true,
      message: "Sync completed",
      details: {
        syncedClients,
        syncedTickets,
        syncedProducts
      }
    });

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
