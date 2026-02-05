// API Proxy endpoint
const PROXY_URL = "https://dashing-alpaca-785.convex.site/v1/generate";
// Default model - Gemini 3 Flash Preview
export const DEFAULT_MODEL = "gemini-3-flash-preview";
// Import Google Generative AI SDK for BYOK (Bring Your Own Key)
import { GoogleGenAI } from "@google/genai";
// Get and validate API key - supports both platform keys (gd_) and Google API keys (AIza)
function getApiKey() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Missing API_KEY environment variable. " +
            "Use either a platform key (gd_xxx) from https://gemini-design-mcp.com/dashboard/api-keys " +
            "or a Google API key (AIza...) from https://aistudio.google.com/apikey");
    }
    // Accept both platform keys (gd_) and Google API keys (AIza)
    if (!apiKey.startsWith("gd_") && !apiKey.startsWith("AIza")) {
        throw new Error("Invalid API key format. Use either:\n" +
            "- Platform key starting with 'gd_' from https://gemini-design-mcp.com/dashboard/api-keys\n" +
            "- Google API key starting with 'AIza' from https://aistudio.google.com/apikey");
    }
    return apiKey;
}
// Generate via platform proxy (for gd_ keys)
async function generateViaProxy(apiKey, systemPrompt, userPrompt, model, thinkingMode, endpoint) {
    const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            endpoint,
            contents: [
                {
                    role: "user",
                    parts: [{ text: userPrompt }],
                },
            ],
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            generationConfig: {
                temperature: 1,
            },
            // Pass thinking mode for billing/logging purposes
            thinkingMode,
        }),
    });
    const result = await response.json();
    if (!response.ok) {
        const errorMsg = result.error || `API error: ${response.status}`;
        // Check for credit/quota related errors
        if (errorMsg.toLowerCase().includes('credit') ||
            errorMsg.toLowerCase().includes('quota') ||
            errorMsg.toLowerCase().includes('insufficient') ||
            errorMsg.toLowerCase().includes('limit') ||
            response.status === 402 ||
            response.status === 429) {
            throw new Error(`${errorMsg}\n\n Top up your credits here: https://gemini-design-mcp.com/settings/billing`);
        }
        throw new Error(errorMsg);
    }
    // Extract text from Gemini response format
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("No content in response");
    }
    return text;
}
// Generate via direct Google API (for AIza keys - BYOK)
async function generateViaDirect(apiKey, systemPrompt, userPrompt, model) {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model,
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            temperature: 1,
        },
    });
    const text = response.text;
    if (!text) {
        throw new Error("No content in response from Google API");
    }
    return text;
}
export async function generateWithGemini(systemPrompt, userPrompt, model = DEFAULT_MODEL, thinkingMode = "minimal", endpoint = "generate") {
    const apiKey = getApiKey();
    const isGoogleKey = apiKey.startsWith("AIza");
    try {
        if (isGoogleKey) {
            // BYOK: Direct call to Google API
            return await generateViaDirect(apiKey, systemPrompt, userPrompt, model);
        } else {
            // Platform key: Use proxy
            return await generateViaProxy(apiKey, systemPrompt, userPrompt, model, thinkingMode, endpoint);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const source = isGoogleKey ? "Google Gemini API" : "Gemini Design API";
        console.error(`${source} error:`, errorMessage);
        throw new Error(`${source} error: ${errorMessage}`);
    }
}
