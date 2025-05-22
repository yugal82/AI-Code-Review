import Groq from "groq-sdk";
import { logger } from './logger';
import { redis, CACHE_TTL, generateCacheKey } from '../config/redis';

if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LLAMA_MODEL = "llama3-70b-8192"; // or "llama3-8b-8192" for smaller model
const MAX_TOKENS = 2048;

// PROMPTS FOR THE MODEL
const CODE_ANALYSIS_PROMPT = `You are an expert code reviewer with deep knowledge of software engineering best practices, 
design patterns, and security principles. Analyze the provided code and provide detailed feedback in the following categories:

1. Style and Readability:
   - Code organization and structure
   - Naming conventions
   - Documentation and comments
   - Code formatting and consistency

2. Performance:
   - Algorithm efficiency
   - Resource usage
   - Potential bottlenecks
   - Optimization opportunities

3. Security:
   - Input validation
   - Data protection
   - Authentication/Authorization
   - Common vulnerabilities

Format your response as a JSON object with arrays for each category. Each suggestion should be specific and actionable.
Code to analyze:`;

const CODE_REFACTOR_PROMPT = `You are an expert software engineer specializing in code refactoring and clean code principles. 
Your task is to refactor the provided code while maintaining its functionality. Consider the following aspects:

1. Code Quality:
   - Apply SOLID principles
   - Improve code organization
   - Enhance readability
   - Remove code smells

2. Best Practices:
   - Use modern language features
   - Implement proper error handling
   - Add appropriate documentation
   - Follow design patterns where applicable

3. Performance:
   - Optimize algorithms
   - Reduce complexity
   - Improve resource usage

Return a JSON object containing both the original and refactored code, along with the improvements made.
Code to refactor:`;

// ANALYSIS LOGIC FROM HERE
function parseAnalysisJson(input: string | null): {
    style: string[];
    performance: string[];
    security: string[];
} {
    const result = { style: [] as string[], performance: [] as string[], security: [] as string[] };

    function grab(key: string, outKey: keyof typeof result) {
        const re = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`);
        const m = input?.match(re);
        if (!m) return;
        const block = m[1];

        // match any quoted string (even with backticks inside) followed by an optional comma
        const lineRe = /"([^"]+)"\s*,?/g;
        let lineMatch;
        while ((lineMatch = lineRe.exec(block))) {
            result[outKey].push(lineMatch[1].trim());
        }
    }

    grab("Style and Readability", "style");
    grab("Performance", "performance");
    grab("Security", "security");

    return result;
}


export const analyzeCodeWithAI = async (code: string) => {
    try {
        const cacheKey = generateCacheKey.analysis(code);
        const cachedResult = await redis.get(cacheKey);
        if (cachedResult) {
            logger.info('Retrieved code analysis from cache (Llama/Groq)');
            return JSON.parse(cachedResult);
        }

        const prompt = `${CODE_ANALYSIS_PROMPT}\n\n${code}`;
        logger.info('Calling Groq Llama chatCompletion API...');
        const response = await groq.chat.completions.create({
            model: LLAMA_MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: MAX_TOKENS,
            temperature: 0.3,
            top_p: 0.95,
        });

        const content = response.choices?.[0]?.message?.content;
        const analysis = parseAnalysisJson(content);

        const result = {
            style: analysis.style || [],
            performance: analysis.performance || [],
            security: analysis.security || []
        };

        await redis.setex(cacheKey, CACHE_TTL.CODE_ANALYSIS, JSON.stringify(result));
        return result;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};


// REFACTOR LOGIC FROM HERE
function parseRefactorJson(input: string | null) {
    let original = "";
    let refactored = "";
    let improvements: string[] = [];

    // 1) Try JSON-style extraction for originalCode/refactoredCode/improvements
    const jsonOrig = input?.match(/"originalCode"\s*:\s*"([\s\S]*?)"/);
    const jsonRef = input?.match(/"refactoredCode"\s*:\s*"([\s\S]*?)"/);
    const jsonImps = input?.match(/"improvements"\s*:\s*\[([\s\S]*?)\]/);

    if (jsonOrig) {
        original = jsonOrig[1].replace(/\\"/g, `"`).trim();
    }
    if (jsonRef) {
        refactored = jsonRef[1].replace(/\\"/g, `"`).trim();
    }
    if (jsonImps) {
        improvements = Array.from(
            jsonImps[1].matchAll(/"([^"]+?)"/g),
            m => m[1].trim()
        );
    }

    // 2) Fallback to Markdown code-blocks if JSON keys weren’t found
    if (!original) {
        const mdOrig = input?.match(
            /\*\*Original Code\*\*\s*```(?:[\w-]*\n)?([\s\S]*?)```/
        );
        original = mdOrig ? mdOrig[1].trim() : original;
    }
    if (!refactored) {
        const mdRef = input?.match(
            /\*\*Refactored Code\*\*\s*```(?:[\w-]*\n)?([\s\S]*?)```/
        );
        let block = mdRef ? mdRef[1].trim() : "";
        // If the block itself is JSON, pull out the nested refactoredCode field
        const nested = block.match(/"refactoredCode"\s*:\s*"([\s\S]*?)"/);
        refactored = nested
            ? nested[1].replace(/\\"/g, `"`).trim()
            : block;
    }

    // 3) Fallback to bullet-list parsing if JSON improvements weren’t found
    if (improvements.length === 0) {
        // isolate the improvements section by looking for common headings
        const impSection = input?.match(
            /\*\*(?:Key Improvements|Improvements Made)\**:?\s*([\s\S]*?)(?=(\n\*\*|\n#{1,2}\s|\n$))/
        );
        const sectionText: string | null = impSection ? impSection[1] : input;
        if (!sectionText) throw new Error("No improvements section found");
        // grab every line that starts with a bullet
        const bulletRe = /^\s*[*-]\s+(.+)$/gm;
        let m;
        while ((m = bulletRe.exec(sectionText))) {
            improvements.push(m[1].trim());
        }
    }

    return { original, refactored, improvements };
}

export const refactorCodeWithAI = async (code: string) => {
    try {
        const cacheKey = generateCacheKey.refactor(code);
        const cachedResult = await redis.get(cacheKey);

        if (cachedResult) {
            logger.info('Retrieved code refactor from cache (Llama/Groq)');
            return JSON.parse(cachedResult);
        }

        const prompt = `${CODE_REFACTOR_PROMPT}\n\n${code}`;
        logger.info('Calling Groq Llama chatCompletion API for refactor...');
        const response = await groq.chat.completions.create({
            model: LLAMA_MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: MAX_TOKENS,
            temperature: 0.2,
            top_p: 0.95,
        });

        const content = response.choices?.[0]?.message?.content;
        const result = parseRefactorJson(content);

        const refactored = {
            original: code,
            refactored: result.refactored || code,
            improvements: result.improvements || []
        };
        // Cache the result
        await redis.setex(cacheKey, CACHE_TTL.CODE_REFACTOR, JSON.stringify(refactored));
        return refactored;
    } catch (error) {
        logger.error('Error in Llama code refactoring:', error);
        throw error;
    }
}; 