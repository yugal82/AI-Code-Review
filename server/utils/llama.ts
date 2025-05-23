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
Refactor the provided code according to these aspects:

1. Code Quality:
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

**Output ONLY** a JSON object with exactly these three fields (and nothing else):

{
  "original": "<the original code as a string>",
  "refactored": "<the refactored code as a string>",
  "improvements": ["<first improvement>", "<second improvement>", ...]
}

Do not include any explanatory text, headings, or formatting outside of this JSON.  
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
function parseRefactorJson(input: string | null): {
    original: string;
    refactored: string;
    improvements: string[];
} {
    // Grab the JSON blob from the first “{” to the last “}”
    const match = input?.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("No JSON object found in input");
    }
    const parsed = JSON.parse(match[0]);

    return {
        original: parsed.original ?? "",
        refactored: parsed.refactored ?? "",
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
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
            refactored: result?.refactored,
            improvements: result?.improvements || []
        };
        // Cache the result
        await redis.setex(cacheKey, CACHE_TTL.CODE_REFACTOR, JSON.stringify(refactored));
        return refactored;
    } catch (error) {
        logger.error('Error in Llama code refactoring:', error);
        throw error;
    }
}; 