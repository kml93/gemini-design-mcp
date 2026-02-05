import { z } from "zod";
import { generateWithGemini } from "../lib/gemini.js";
import { SNIPPET_FRONTEND_PROMPT, DESIGN_SYSTEM_USAGE_INSTRUCTIONS } from "../prompts/system.js";
export const snippetFrontendSchema = {
    request: z.string().describe("What code snippet to generate. Be specific about what you need. " +
        "Examples: " +
        "'A sidebar component with navigation links and user profile section', " +
        "'A data table with sorting, filtering, and pagination', " +
        "'A form validation function for email and password', " +
        "'A custom hook for handling API requests with loading/error states'"),
    techStack: z.string().describe("The tech stack being used. " +
        "Examples: 'React + TypeScript + Tailwind CSS', 'Vue 3 + Composition API', 'Svelte + CSS'..."),
    designSystem: z.string().describe("REQUIRED: Copy-paste the ENTIRE content of design-system.md here. " +
        "This contains ALL visual/design information: colors, typography, spacing, components styling, etc. " +
        "Do NOT summarize - paste the FULL file content as-is."),
    context: z.string().describe("REQUIRED: Functional context for this snippet. " +
        "What is the PURPOSE of this snippet? What should it DO? " +
        "Include: its role in the app, what data it handles, what actions it performs, " +
        "how it interacts with other parts of the app, business requirements. " +
        "Do NOT include design/styling info here - that goes in designSystem."),
    insertionContext: z.string().describe("WHERE in the file this snippet will go. " +
        "Example: 'Inside the Dashboard component, after the header section.'"),
};
export async function snippetFrontend(params) {
    const { request, techStack, designSystem, context, insertionContext } = params;

    const systemPrompt = `${SNIPPET_FRONTEND_PROMPT}
${DESIGN_SYSTEM_USAGE_INSTRUCTIONS}

## DESIGN SYSTEM (COPY EXACTLY - ALL CODE):

${designSystem}

---

## FUNCTIONAL CONTEXT (what this snippet should DO):

${context}

---

TECH STACK: ${techStack}

INSERTION CONTEXT:
${insertionContext}

CRITICAL RULES:
- Copy EXACTLY the styles, classes, colors, spacing, patterns from the design system above.
- NEVER invent new values. The snippet must look EXACTLY like the design system.
- Implement the functional requirements from the context above.

Generate a snippet that will integrate smoothly at this location.`.trim();

    const result = await generateWithGemini(systemPrompt, request, undefined, "high", "snippet_frontend");
    return {
        content: [{ type: "text", text: result }],
    };
}
