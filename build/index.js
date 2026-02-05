#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { createFrontendSchema, createFrontend } from "./tools/create-frontend.js";
import { modifyFrontendSchema, modifyFrontend } from "./tools/modify-frontend.js";
import { snippetFrontendSchema, snippetFrontend } from "./tools/snippet-frontend.js";

// =============================================================================
// HELPER: Create and configure MCP server with all tools
// =============================================================================
function createMcpServer() {
    const server = new McpServer({
        name: "gemini-design-mcp",
        version: "3.10.1",
    });

    // TOOL 1: CREATE_FRONTEND
    server.tool("create_frontend", `Create a NEW, complete frontend file with PREMIUM DESIGN quality.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHEN TO USE THIS TOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This tool is for creating NEW files that need HIGH-QUALITY DESIGN.

✅ USE THIS TOOL FOR:
  • "Create a pricing page" → New file with designed UI
  • "Create a dashboard" → New file with designed UI
  • "Create a landing page" → New file with designed UI
  • "Create a user profile component" → New file with designed UI

❌ DO NOT USE THIS TOOL FOR:
  • Creating utility functions → You can do this yourself
  • Creating TypeScript types → You can do this yourself
  • Creating config files → You can do this yourself

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MANDATORY: CHECK FOR design-system.md FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE calling this tool, check if design-system.md exists at project root.

IF IT DOES NOT EXIST:
  1. Ask the user which scale they want BEFORE any frontend call:
     - refined (small, Apple/Notion-like sizing)
     - balanced (medium, standard sizing)
     - zoomed (large, bold sizing)
  2. Call create_frontend FIVE TIMES to generate five distinct vibe sections (NOT full pages).
     - Each call must output a single self-contained section component/snippet.
     - Pass the selected scale in the scale parameter.
  3. Assemble the five sections into a single page (e.g. vibes-selection.tsx).
  4. Ask the user to open the page and pick a vibe (e.g. "vibe 3").
  5. Extract THE ENTIRE code for the chosen section.
  6. Save it to design-system.md.
  7. Ask: "Delete vibes-selection.tsx?"
  8. THEN call this tool as normal

IF IT EXISTS:
  Read it and pass its ENTIRE content in the designSystem parameter.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PARAMETERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• designSystem: REQUIRED if design-system.md exists (omit for initial 5-section vibe generation). Copy-paste the ENTIRE content (all the code)
• context: Functional/business context only (what it does, features, requirements)
• scale (optional): 'refined' | 'balanced' | 'zoomed' (small/medium/large sizing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Returns the complete code. YOU (the agent) are responsible for writing it to disk.`, createFrontendSchema, createFrontend);

    // TOOL 2: MODIFY_FRONTEND
    server.tool("modify_frontend", `Redesign a SINGLE UI element. Returns ONLY the changed code (find/replace format).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: ONE MODIFICATION PER CALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This tool makes exactly ONE design modification at a time.
If you need multiple changes, call this tool MULTIPLE TIMES IN PARALLEL.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHEN TO USE THIS TOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this to REDESIGN existing UI elements that need better design.

✅ USE THIS TOOL FOR:
  • "The sidebar looks ugly, redesign it"
  • "Make this card look more premium"
  • "This header looks dated, refresh it"
  • "The buttons look boring, make them better"

❌ DO NOT USE THIS TOOL FOR:
  • "Make the sidebar collapsible" → Just logic (useState), do it yourself
  • "Change background to blue" → Just change the class yourself
  • "Add onClick handler" → Just code, do it yourself
  • "Center this div" → Just add flex classes yourself

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PARAMETERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• designSystem: Copy-paste the ENTIRE content of design-system.md (all the code)
• context: Functional/business context only (what the modification achieves)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// NEW IMPORTS NEEDED: (if any)
import { X } from "y";

// FIND THIS CODE:
<exact existing code>

// REPLACE WITH:
<new redesigned code>

YOU (the agent) are responsible for applying this find/replace to the file.`, modifyFrontendSchema, modifyFrontend);

    // TOOL 3: SNIPPET_FRONTEND
    server.tool("snippet_frontend", `Generate the JSX/HTML for a NEW UI component to INSERT into an existing file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL: SEPARATION OF CONCERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When adding a new UI feature:
  • YOU (Claude) handle the LOGIC: useState, handlers, data, conditions
  • GEMINI handles the JSX/HTML: the actual UI component with premium design

EXAMPLE - User: "Add a search dropdown with results"

  YOU do this yourself:
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const filteredResults = data.filter(...)

  GEMINI does this (via snippet_frontend):
    <div className="relative">
      <input className="..." />
      {showDropdown && (
        <div className="absolute ..."> // Premium designed dropdown
          {filteredResults.map(item => (
            <div className="..."> // Beautiful result items
              <Icon />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHEN TO USE THIS TOOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this for ANY new UI component that needs visual design:

✅ USE THIS TOOL FOR (Gemini designs the JSX):
  • "Add a sidebar" → You add state, Gemini designs the sidebar JSX
  • "Add a search dropdown" → You add useState/filtering, Gemini designs the dropdown JSX
  • "Add a modal" → You add open/close state, Gemini designs the modal JSX
  • "Add a notification toast" → You add state, Gemini designs the toast JSX
  • "Add a stats section" → You add data, Gemini designs the stats cards JSX
  • "Add a navigation menu" → You add routing logic, Gemini designs the menu JSX
  • "Add a user avatar dropdown" → You add state, Gemini designs the dropdown JSX
  • "Add a data table" → You add sorting/filtering, Gemini designs the table JSX

❌ DO NOT USE THIS TOOL FOR (too simple, do it yourself):
  • "Add a single button" → Just write <button>
  • "Add an input field" → Just write <input>
  • "Add a simple link" → Just write <a> or <Link>
  • "Add a loading spinner" → Just a simple div with animation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 THE RULE: If it has multiple elements + needs to look good → snippet_frontend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Component                    | Use snippet_frontend? | Why                        |
|------------------------------|----------------------|----------------------------|
| Search dropdown with results | ✅ YES               | Multiple elements, design  |
| Sidebar with nav items       | ✅ YES               | Multiple elements, design  |
| Modal with form              | ✅ YES               | Multiple elements, design  |
| Card grid                    | ✅ YES               | Multiple elements, design  |
| Data table                   | ✅ YES               | Multiple elements, design  |
| Single button                | ❌ NO                | Too simple                 |
| Single input                 | ❌ NO                | Too simple                 |
| Loading spinner              | ❌ NO                | Too simple                 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PARAMETERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• designSystem: Copy-paste the ENTIRE content of design-system.md (all the code)
• context: Functional/business context only (what it does, features, requirements)
• insertionContext: WHERE in the file this snippet will go (after header, inside main, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If external dependency required:
// REQUIRED DEPENDENCY: <package-name> (<install command>)

// NEW IMPORTS NEEDED:
<import statements>

// SNIPPET:
<functional, interactive code>

⚠️ Gemini ALWAYS returns FUNCTIONAL code - never static mockups.
If a component needs a library to work properly, Gemini specifies which one.

YOU (the agent) are responsible for:
- Installing any REQUIRED DEPENDENCY specified by Gemini
- Adding the logic (useState, handlers) BEFORE calling this tool
- Inserting the returned snippet into the correct location in the file`, snippetFrontendSchema, snippetFrontend);

    return server;
}

// =============================================================================
// START SERVER
// =============================================================================
async function main() {
    const transportType = process.env.TRANSPORT || "stdio";

    if (transportType === "http" || transportType === "streamable-http") {
        // Streamable HTTP mode (NEW - recommended for remote connections)
        const app = express();

        app.use(cors({
            origin: "*",
            methods: ["GET", "POST", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "mcp-session-id"],
            exposedHeaders: ["mcp-session-id"],
            credentials: true,
        }));
        app.use(express.json());

        // Store active transports and servers by session
        const transports = new Map();
        const servers = new Map();

        // Health check endpoint
        app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                service: "gemini-design-mcp",
                version: "3.10.1",
                transport: "streamable-http",
                timestamp: Date.now(),
            });
        });

        // Main MCP endpoint - handles all communication
        app.post("/mcp", async (req, res) => {
            const sessionId = req.headers["mcp-session-id"];
            let transport = sessionId ? transports.get(sessionId) : undefined;

            if (transport) {
                // Existing session - reuse transport
                console.log(`[MCP] Reusing session: ${sessionId}`);
                await transport.handleRequest(req, res, req.body);
            } else if (!sessionId && isInitializeRequest(req.body)) {
                // New session - create transport and server
                console.log("[MCP] New session initialization");

                // Extract API key from Authorization header
                const authHeader = req.headers.authorization;
                const apiKey = authHeader?.replace("Bearer ", "");

                if (apiKey && (apiKey.startsWith("gd_") || apiKey.startsWith("AIza"))) {
                    process.env.API_KEY = apiKey;
                }

                const newTransport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (sid) => {
                        transports.set(sid, newTransport);
                        console.log(`[MCP] Session initialized: ${sid}`);
                    },
                });

                // Clean up on close
                newTransport.onclose = () => {
                    if (newTransport.sessionId) {
                        console.log(`[MCP] Session closed: ${newTransport.sessionId}`);
                        transports.delete(newTransport.sessionId);
                        servers.delete(newTransport.sessionId);
                    }
                };

                // Create new server instance for this session
                const server = createMcpServer();
                servers.set(newTransport.sessionId, server);

                // Connect server to transport
                await server.connect(newTransport);

                // Handle the initialization request
                await newTransport.handleRequest(req, res, req.body);
            } else {
                // Invalid request
                console.warn("[MCP] Bad request - no session ID or not an init request");
                res.status(400).json({
                    error: "Bad Request: No valid session ID provided and not an initialization request",
                });
            }
        });

        // GET for server-to-client streaming (optional, for long-running operations)
        app.get("/mcp", async (req, res) => {
            const sessionId = req.headers["mcp-session-id"];
            const transport = sessionId ? transports.get(sessionId) : undefined;

            if (!transport) {
                return res.status(404).json({ error: "Session not found" });
            }

            await transport.handleRequest(req, res);
        });

        // DELETE for explicit session termination
        app.delete("/mcp", async (req, res) => {
            const sessionId = req.headers["mcp-session-id"];
            const transport = sessionId ? transports.get(sessionId) : undefined;

            if (!transport) {
                return res.status(404).json({ error: "Session not found" });
            }

            await transport.handleRequest(req, res);
        });

        // =========================================================================
        // LEGACY SSE ENDPOINTS (for backwards compatibility with mcp-remote)
        // =========================================================================
        // Keep SSE support for clients that haven't migrated yet
        const { SSEServerTransport } = await import("@modelcontextprotocol/sdk/server/sse.js");
        const sseTransports = new Map();

        app.get("/sse", async (req, res) => {
            const authHeader = req.headers.authorization;
            const apiKey = authHeader?.replace("Bearer ", "");

            const isValidKey = apiKey && (apiKey.startsWith("gd_") || apiKey.startsWith("AIza"));
            if (!isValidKey) {
                return res.status(401).json({
                    error: "Missing or invalid API key. Use Authorization: Bearer <key>",
                });
            }

            process.env.API_KEY = apiKey;

            const transport = new SSEServerTransport("/messages", res);
            const sessionId = transport.sessionId;
            sseTransports.set(sessionId, transport);

            res.setHeader("mcp-session-id", sessionId);

            res.on("close", () => {
                console.log("[SSE] Connection closed for session:", sessionId);
                sseTransports.delete(sessionId);
            });

            const server = createMcpServer();
            await server.connect(transport);

            // Keepalive every 5s
            const keepAlive = setInterval(() => {
                try {
                    res.write(":keepalive\n\n");
                } catch {
                    // Ignore errors
                }
            }, 5000);
            res.on("close", () => clearInterval(keepAlive));
        });

        app.post("/messages", async (req, res) => {
            const headerSession = req.headers["mcp-session-id"];
            const headerSessionId = Array.isArray(headerSession) ? headerSession[0] : headerSession;
            let sessionId = req.query.sessionId || headerSessionId;
            let transport = sessionId ? sseTransports.get(sessionId) : undefined;

            if (!transport && !sessionId && sseTransports.size === 1) {
                const onlyEntry = sseTransports.entries().next().value;
                if (onlyEntry) {
                    sessionId = onlyEntry[0];
                    transport = onlyEntry[1];
                }
            }

            if (!transport) {
                return res.status(400).json({ error: "Invalid or expired session" });
            }

            try {
                await transport.handlePostMessage(req, res, req.body);
            } catch (error) {
                console.error("[SSE] Error handling message:", error);
                if (!res.headersSent) {
                    res.status(400).json({ error: "Invalid message" });
                }
            }
        });

        const port = parseInt(process.env.PORT || "3000", 10);
        app.listen(port, "0.0.0.0", () => {
            console.log(`gemini-design-mcp v3.10.1 running on Streamable HTTP transport`);
            console.log(`  MCP endpoint: http://0.0.0.0:${port}/mcp`);
            console.log(`  Legacy SSE: http://0.0.0.0:${port}/sse`);
            console.log(`  Health check: http://0.0.0.0:${port}/health`);
        });
    } else {
        // Stdio mode (default, for local IDE usage)
        const server = createMcpServer();
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("gemini-design-mcp v3.10.1 running on stdio");
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
