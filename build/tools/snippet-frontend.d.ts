import { z } from "zod";
export declare const snippetFrontendSchema: {
    request: z.ZodString;
    techStack: z.ZodString;
    designSystem: z.ZodString;
    context: z.ZodString;
    insertionContext: z.ZodString;
};
export declare function snippetFrontend(params: {
    request: string;
    techStack: string;
    designSystem: string;
    context: string;
    insertionContext: string;
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
