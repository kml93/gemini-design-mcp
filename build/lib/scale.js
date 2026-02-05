import { z } from "zod";
// Scale schema for validation
export const scaleSchema = z.enum(["refined", "balanced", "zoomed"]).describe("Scale: 'refined' (small, elegant elements), 'balanced' (standard sizing), 'zoomed' (large elements)");
// Conceptual scale descriptions - let Gemini decide exact values
export const scaleDescriptions = {
    refined: `**SCALE: REFINED**
This is about ELEMENT SIZE, not density. Refined means:
- Smaller, more elegant typography — avoid oversized headlines
- Compact, contained buttons — not chunky or oversized
- Cards and containers with constrained widths — not full-width sprawling layouts
- Tighter, purposeful spacing between elements
- Smaller icons that complement rather than dominate

Reference: Linear.app, Raycast, Notion — these apps feel sophisticated because their elements are proportionally small and refined, never billboard-sized or bloated.

The interface should feel like a premium Swiss watch: precise, elegant, where every element is intentionally sized smaller than the default.`,
    balanced: `**SCALE: BALANCED**
Standard, conventional sizing. Use typical defaults — nothing particularly large or small. A middle-ground that works for most general-purpose applications.`,
    zoomed: `**SCALE: ZOOMED**
This is about ELEMENT SIZE, not density. Zoomed means:
- Large, prominent typography — bold headlines that command attention
- Big, chunky buttons — easy to see and click/tap
- Wide cards and containers — full-width or near full-width layouts
- Generous spacing and padding throughout
- Large icons that stand out

Reference: Kids apps, accessibility-focused interfaces, bold marketing sites — elements are intentionally oversized for impact and ease of use.`
};
/**
 * Generate scale instructions for prompts
 * @param scale The scale to use (defaults to "balanced")
 * @returns Formatted scale instructions string
 */
export function getScaleInstructions(scale) {
    const effectiveScale = scale || "balanced";
    return `
${scaleDescriptions[effectiveScale]}

The scale above is MANDATORY and defines how large or small UI elements should be.
`;
}
