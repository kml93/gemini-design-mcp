export type ThinkingMode = "minimal" | "low" | "medium" | "high";
export declare const DEFAULT_MODEL = "gemini-3-flash-preview";
export declare function generateWithGemini(systemPrompt: string, userPrompt: string, model?: string, thinkingMode?: ThinkingMode, endpoint?: string): Promise<string>;
