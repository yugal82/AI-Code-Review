import OpenAI from 'openai';
import { logger } from './logger';
import { redis, CACHE_TTL, generateCacheKey } from '../config/redis';


if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

export const analyzeCodeWithAI = async (code: string) => {
    try {
        // Check cache first
        const cacheKey = generateCacheKey.analysis(code);
        const cachedResult = await redis.get(cacheKey);

        if (cachedResult) {
            logger.info('Retrieved code analysis from cache');
            return JSON.parse(cachedResult);
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-0125-preview", // Latest GPT-4 model optimized for code
            messages: [
                {
                    role: "system",
                    content: "You are an expert code reviewer. Provide detailed, actionable feedback in JSON format."
                },
                {
                    role: "user",
                    content: `${CODE_ANALYSIS_PROMPT}\n\n${code}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3, // Lower temperature for more consistent results
            max_tokens: 2000
        });

        const analysis = JSON.parse(response.choices[0].message.content || '{}');
        const result = {
            style: analysis.style || [],
            performance: analysis.performance || [],
            security: analysis.security || []
        };

        // Cache the result
        await redis.setex(cacheKey, CACHE_TTL.CODE_ANALYSIS, JSON.stringify(result));

        return result;
    } catch (error) {
        logger.error('Error in AI code analysis:', error);
        throw error;
    }
};

export const refactorCodeWithAI = async (code: string) => {
    try {
        // Check cache first
        const cacheKey = generateCacheKey.refactor(code);
        const cachedResult = await redis.get(cacheKey);

        if (cachedResult) {
            logger.info('Retrieved code refactor from cache');
            return JSON.parse(cachedResult);
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4-0125-preview", // Latest GPT-4 model optimized for code
            messages: [
                {
                    role: "system",
                    content: "You are an expert code refactoring assistant. Provide refactored code with explanations in JSON format."
                },
                {
                    role: "user",
                    content: `${CODE_REFACTOR_PROMPT}\n\n${code}`
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2, // Lower temperature for more consistent results
            max_tokens: 4000
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        const refactored = {
            original: code,
            refactored: result.refactored || code,
            improvements: result.improvements || []
        };

        // Cache the result
        await redis.setex(cacheKey, CACHE_TTL.CODE_REFACTOR, JSON.stringify(refactored));

        return refactored;
    } catch (error) {
        logger.error('Error in AI code refactoring:', error);
        throw error;
    }
}; 