import { z } from "zod";
export declare const createFrontendSchema: {
    request: z.ZodString;
    techStack: z.ZodString;
    designSystem: z.ZodOptional<z.ZodString>;
    context: z.ZodString;
    scale: z.ZodOptional<z.ZodEnum<["refined", "balanced", "zoomed"]>>;
};
export declare function createFrontend(params: {
    request: string;
    techStack: string;
    designSystem?: string;
    context: string;
    scale?: "refined" | "balanced" | "zoomed";
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
