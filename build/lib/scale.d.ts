import { z } from "zod";
export declare const scaleSchema: z.ZodEnum<["refined", "balanced", "zoomed"]>;
export type Scale = z.infer<typeof scaleSchema>;
export declare const scaleDescriptions: Record<Scale, string>;
/**
 * Generate scale instructions for prompts
 * @param scale The scale to use (defaults to "balanced")
 * @returns Formatted scale instructions string
 */
export declare function getScaleInstructions(scale?: Scale): string;
