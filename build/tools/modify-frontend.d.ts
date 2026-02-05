import { z } from "zod";
export declare const modifyFrontendSchema: {
    modification: z.ZodString;
    targetCode: z.ZodString;
    designSystem: z.ZodString;
    context: z.ZodString;
};
export declare function modifyFrontend(params: {
    modification: string;
    targetCode: string;
    designSystem: string;
    context: string;
}): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
