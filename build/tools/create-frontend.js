import { z } from "zod";
import { generateWithGemini } from "../lib/gemini.js";
import { CREATE_FRONTEND_PROMPT, DESIGN_SYSTEM_USAGE_INSTRUCTIONS } from "../prompts/system.js";
import { stripCodeFences } from "../lib/filesystem.js";
import { scaleSchema, getScaleInstructions } from "../lib/scale.js";
export const createFrontendSchema = {
    request: z.string().describe("What to create: describe the page, component, or section. " +
        "Be specific about functionality and content. " +
        "Example: 'A pricing page with 3 tiers (Basic, Pro, Enterprise) with feature comparison table'"),
    techStack: z.string().describe("The tech stack to use. Be specific. " +
        "Examples: 'React + TypeScript + Tailwind CSS', 'Next.js 14 App Router + shadcn/ui', 'Vue 3 + Composition API'..."),
    designSystem: z.string().optional().describe("REQUIRED if design-system.md exists. " +
        "Copy-paste the ENTIRE content of design-system.md here. " +
        "This contains ALL visual/design information: colors, typography, spacing, components styling, etc. " +
        "Do NOT summarize - paste the FULL file content as-is."),
    context: z.string().describe("REQUIRED: Functional/business context for what you're creating. " +
        "What is the PURPOSE of this page/component? What should it DO? " +
        "Include: user flow, features needed, data it displays, actions it performs, " +
        "how it fits in the app, business requirements. " +
        "Do NOT include design/styling info here - that goes in designSystem."),
    scale: scaleSchema.optional().describe("Optional scale for sizing: 'refined' (small, elegant), " +
        "'balanced' (standard sizing), 'zoomed' (large, bold)."),
};
export async function createFrontend(params) {
    const { request, techStack, designSystem, context, scale } = params;

    const hasDesignSystem = typeof designSystem === "string" && designSystem.trim().length > 0;
    const scaleInstructions = scale ? getScaleInstructions(scale) : "";
    const designSystemSection = hasDesignSystem
        ? `${DESIGN_SYSTEM_USAGE_INSTRUCTIONS}

## DESIGN SYSTEM (COPY EXACTLY - ALL CODE):

${designSystem}

---`
        : `## NO DESIGN SYSTEM PROVIDED

Create a cohesive, production-ready visual system from scratch. Define colors, typography, spacing, radius, and shadows, then apply them consistently.

---`;
    const criticalRules = hasDesignSystem
        ? `CRITICAL RULES:
- Copy EXACTLY the styles, classes, colors, spacing, patterns from the design system above.
- NEVER invent new values. The new component must look EXACTLY like the design system.
- Implement the functional requirements from the context above.`
        : `CRITICAL RULES:
- Define a clear visual system and apply it consistently across the output.
- Keep the output cohesive and production-ready.
- Implement the functional requirements from the context above.`;

    const systemPrompt = `${CREATE_FRONTEND_PROMPT}
${scaleInstructions ? `${scaleInstructions}\n` : ""}${designSystemSection}

## FUNCTIONAL CONTEXT (what it should DO):

${context}

---

TECH STACK: ${techStack}

${criticalRules}

Remember: Return a COMPLETE, functional file ready to use.`.trim();

    const rawResult = await generateWithGemini(systemPrompt, request, undefined, "high", "create_frontend");
    const result = stripCodeFences(rawResult);
    return {
        content: [{ type: "text", text: result }],
    };
}
