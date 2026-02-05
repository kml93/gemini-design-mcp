/**
 * Strip markdown code fences from a string
 * Removes ```language and ``` from the beginning and end
 */
export declare function stripCodeFences(code: string): string;
/**
 * Write a file, creating parent directories if they don't exist
 */
export declare function writeFileWithDirs(filePath: string, content: string): void;
/**
 * Read a file if it exists, return null otherwise
 */
export declare function readFileIfExists(filePath: string): string | null;
/**
 * Get file size in human readable format
 */
export declare function getFileSize(content: string): string;
/**
 * Parse FIND/REPLACE format from Gemini output
 * Returns null if parsing fails
 */
export declare function parseFindReplace(geminiOutput: string): {
    imports?: string;
    find: string;
    replace: string;
} | null;
/**
 * Parse SNIPPET format from Gemini output
 * Returns null if parsing fails
 */
export declare function parseSnippet(geminiOutput: string): {
    imports?: string;
    snippet: string;
} | null;
/**
 * Apply find/replace to file content
 */
export declare function applyFindReplace(fileContent: string, find: string, replace: string): {
    success: boolean;
    newContent: string;
    error?: string;
};
/**
 * Merge new imports into existing file content
 */
export declare function mergeImports(fileContent: string, newImports: string): string;
/**
 * Insert snippet after a specific line number (1-indexed)
 */
export declare function insertAfterLine(fileContent: string, snippet: string, lineNumber: number): string;
/**
 * Insert snippet after a pattern match
 */
export declare function insertAfterPattern(fileContent: string, snippet: string, pattern: string): {
    success: boolean;
    newContent: string;
    error?: string;
};
