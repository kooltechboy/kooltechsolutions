"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
dotenv.config({ path: ".env.local" });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const ITFLOW_URL = "https://itflow.kooltechsolutions.com";
const ITFLOW_KEY = "9-ssk0SbGqBMbVIkjRgiQUXDJTvLJMWv";
const RMM_URL = "https://rmm.kooltechsolutions.com";
const RMM_KEY = "MYBNORE9AYHRHFWLWO2I9CD9R3XKUWSI";
async function probe(label, url, headers) {
    console.log(`\n>> ${label}`);
    console.log(`   URL: ${url}`);
    try {
        const res = await (0, node_fetch_1.default)(url, { headers: { "Accept": "application/json", ...(headers || {}) } });
        const text = await res.text();
        console.log(`   Status: ${res.status}`);
        console.log(`   Body: ${text.slice(0, 400)}`);
    }
    catch (e) {
        console.log(`   ERROR: ${e.message}`);
    }
}
async function probeITFlow() {
    console.log("\n============ ITFlow Probe ============");
    // Try different endpoints to see which ones work with this key scope
    await probe("company/read (global info)", `${ITFLOW_URL}/api/v1/company/read.php?api_key=${ITFLOW_KEY}`);
    await probe("clients/read (all)", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}`);
    await probe("clients/read limit=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&limit=1`);
    // Try with company_id guesses
    await probe("clients/read company_id=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
    await probe("tickets/read company_id=1", `${ITFLOW_URL}/api/v1/tickets/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
    await probe("assets/read company_id=1", `${ITFLOW_URL}/api/v1/assets/read.php?api_key=${ITFLOW_KEY}&company_id=1`);
    // Try client_id variants
    await probe("clients/read client_id=1", `${ITFLOW_URL}/api/v1/clients/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
    await probe("tickets/read client_id=1", `${ITFLOW_URL}/api/v1/tickets/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
    await probe("assets/read client_id=1", `${ITFLOW_URL}/api/v1/assets/read.php?api_key=${ITFLOW_KEY}&client_id=1`);
}
async function probeTacticalRMM() {
    console.log("\n============ Tactical RMM Probe ============");
    // Test different API paths and versions
    await probe("v3/agents", `${RMM_URL}/api/v3/agents/`, { "X-API-KEY": RMM_KEY });
    await probe("v3/agents (no trailing slash)", `${RMM_URL}/api/v3/agents`, { "X-API-KEY": RMM_KEY });
    await probe("v2/agents", `${RMM_URL}/api/v2/agents/`, { "X-API-KEY": RMM_KEY });
    await probe("v1/agents", `${RMM_URL}/api/v1/agents/`, { "X-API-KEY": RMM_KEY });
    // Test auth - try token header variant
    await probe("v3/agents (Authorization Bearer)", `${RMM_URL}/api/v3/agents/`, { "Authorization": `Token ${RMM_KEY}` });
    // Test if the API root responds at all with any JSON
    await probe("API root", `${RMM_URL}/api/`, { "X-API-KEY": RMM_KEY });
}
async function run() {
    await probeITFlow();
    await probeTacticalRMM();
}
run();
