import { z } from "zod";
import { generateWithGemini } from "../lib/gemini.js";
import { MODIFY_FRONTEND_PROMPT, DESIGN_SYSTEM_USAGE_INSTRUCTIONS } from "../prompts/system.js";
export const modifyFrontendSchema = {
    modification: z.string().describe("The SINGLE design modification to make. Be specific. " +
        "Examples: " +
        "'Redesign this button to look more premium with gradient and shadow', " +
        "'Redesign the card header with better typography and spacing', " +
        "'Make this sidebar look more modern with glassmorphism effect'"),
    targetCode: z.string().describe("The specific code section to modify (NOT the full file). " +
        "Pass only the relevant component/element that needs redesigning. " +
        "This helps Gemini focus on exactly what to change."),
    designSystem: z.string().describe("REQUIRED: Copy-paste the ENTIRE content of design-system.md here. " +
        "This contains ALL visual/design information: colors, typography, spacing, components styling, etc. " +
        "Do NOT summarize - paste the FULL file content as-is."),
    context: z.string().describe("REQUIRED: Functional context for the modification. " +
        "WHY are you making this change? What is the PURPOSE? " +
        "Include: what the component should do after modification, user flow changes, " +
        "new features or behaviors expected, business requirements. " +
        "Do NOT include design/styling info here - that goes in designSystem."),
};
export async function modifyFrontend(params) {
    const { modification, targetCode, designSystem, context } = params;

    const systemPrompt = `${MODIFY_FRONTEND_PROMPT}
${DESIGN_SYSTEM_USAGE_INSTRUCTIONS}

## DESIGN SYSTEM (COPY EXACTLY - ALL CODE):

${designSystem}

---

## FUNCTIONAL CONTEXT (why this modification):

${context}

---

CODE TO MODIFY:
\`\`\`
${targetCode}
\`\`\`

MODIFICATION REQUESTED: ${modification}

CRITICAL RULES:
- Copy EXACTLY the styles, classes, colors, spacing, patterns from the design system above.
- NEVER invent new values. The modified code must look EXACTLY like the design system.
- Implement the functional requirements from the context above.

Remember: Return ONLY the find/replace block. ONE modification, surgical precision.`.trim();

    const result = await generateWithGemini(systemPrompt, modification, undefined, "high", "modify_frontend");
    return {
        content: [{ type: "text", text: result }],
    };
}
