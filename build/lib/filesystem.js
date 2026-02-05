import fs from "fs";
import path from "path";
/**
 * Parse Gemini response that contains both code and design system
 * when generateDesignSystem is enabled
 */
export function parseGeminiResponseWithDesignSystem(response) {
    const codeMatch = response.match(/<!-- CODE_START -->([\s\S]*?)<!-- CODE_END -->/);
    const dsMatch = response.match(/<!-- DESIGN_SYSTEM_START -->([\s\S]*?)<!-- DESIGN_SYSTEM_END -->/);
    return {
        code: codeMatch ? codeMatch[1].trim() : response, // fallback si pas de balises
        designSystem: dsMatch ? dsMatch[1].trim() : null
    };
}
/**
 * Load design-system.md from project root if it exists
 * Checks multiple possible file names
 */
export function loadDesignSystemIfExists(projectRoot) {
    const possiblePaths = [
        path.join(projectRoot || process.cwd(), 'design-system.md'),
        path.join(projectRoot || process.cwd(), 'DESIGN-SYSTEM.md'),
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return fs.readFileSync(p, 'utf-8');
        }
    }
    return null;
}
/**
 * Strip markdown code fences from a string
 * Removes ```language and ``` from the beginning and end
 */
export function stripCodeFences(code) {
    let result = code.trim();
    // Remove opening fence: ```tsx, ```jsx, ```typescript, ```javascript, ```html, etc.
    result = result.replace(/^```[\w]*\s*\n?/i, '');
    // Remove closing fence: ```
    result = result.replace(/\n?```\s*$/i, '');
    return result.trim();
}
/**
 * Write a file, creating parent directories if they don't exist
 */
export function writeFileWithDirs(filePath, content) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
}
/**
 * Read a file if it exists, return null otherwise
 */
export function readFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
    }
    return null;
}
/**
 * Get file size in human readable format
 */
export function getFileSize(content) {
    const bytes = Buffer.byteLength(content, "utf-8");
    if (bytes < 1024)
        return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}
/**
 * Parse FIND/REPLACE format from Gemini output
 * Returns null if parsing fails
 */
export function parseFindReplace(geminiOutput) {
    try {
        let imports;
        // Extract imports if present
        const importsMatch = geminiOutput.match(/\/\/ NEW IMPORTS NEEDED:\s*([\s\S]*?)(?=\/\/ FIND THIS CODE:)/);
        if (importsMatch) {
            imports = importsMatch[1].trim();
        }
        // Extract find section
        const findMatch = geminiOutput.match(/\/\/ FIND THIS CODE:\s*([\s\S]*?)(?=\/\/ REPLACE WITH:)/);
        if (!findMatch)
            return null;
        // Extract replace section
        const replaceMatch = geminiOutput.match(/\/\/ REPLACE WITH:\s*([\s\S]*?)$/);
        if (!replaceMatch)
            return null;
        return {
            imports: imports ? stripCodeFences(imports) : undefined,
            find: stripCodeFences(findMatch[1]),
            replace: stripCodeFences(replaceMatch[1]),
        };
    }
    catch {
        return null;
    }
}
/**
 * Parse SNIPPET format from Gemini output
 * Returns null if parsing fails
 */
export function parseSnippet(geminiOutput) {
    try {
        let imports;
        // Extract imports if present
        const importsMatch = geminiOutput.match(/\/\/ NEW IMPORTS NEEDED:\s*([\s\S]*?)(?=\/\/ SNIPPET:)/);
        if (importsMatch) {
            imports = importsMatch[1].trim();
        }
        // Extract snippet
        const snippetMatch = geminiOutput.match(/\/\/ SNIPPET:\s*([\s\S]*?)$/);
        if (!snippetMatch) {
            // If no SNIPPET marker, assume the whole thing (minus imports) is the snippet
            return { imports: imports ? stripCodeFences(imports) : undefined, snippet: stripCodeFences(geminiOutput) };
        }
        return {
            imports: imports ? stripCodeFences(imports) : undefined,
            snippet: stripCodeFences(snippetMatch[1]),
        };
    }
    catch {
        return null;
    }
}
/**
 * Apply find/replace to file content
 */
export function applyFindReplace(fileContent, find, replace) {
    if (!fileContent.includes(find)) {
        return {
            success: false,
            newContent: fileContent,
            error: "Could not find the target code in file",
        };
    }
    const newContent = fileContent.replace(find, replace);
    return { success: true, newContent };
}
/**
 * Merge new imports into existing file content
 */
export function mergeImports(fileContent, newImports) {
    const lines = fileContent.split("\n");
    // Find the last import line
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ") || lines[i].startsWith("import{")) {
            lastImportIndex = i;
        }
    }
    if (lastImportIndex === -1) {
        // No imports found, add at the beginning
        return newImports + "\n" + fileContent;
    }
    // Insert after last import
    lines.splice(lastImportIndex + 1, 0, newImports);
    return lines.join("\n");
}
/**
 * Insert snippet after a specific line number (1-indexed)
 */
export function insertAfterLine(fileContent, snippet, lineNumber) {
    const lines = fileContent.split("\n");
    lines.splice(lineNumber, 0, snippet);
    return lines.join("\n");
}
/**
 * Insert snippet after a pattern match
 */
export function insertAfterPattern(fileContent, snippet, pattern) {
    const index = fileContent.indexOf(pattern);
    if (index === -1) {
        return {
            success: false,
            newContent: fileContent,
            error: `Pattern not found: ${pattern}`,
        };
    }
    const endOfPattern = index + pattern.length;
    const newContent = fileContent.slice(0, endOfPattern) +
        "\n" + snippet +
        fileContent.slice(endOfPattern);
    return { success: true, newContent };
}
