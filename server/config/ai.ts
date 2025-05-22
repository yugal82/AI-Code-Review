import { logger } from '../utils/logger';

export type AIModel = 'openai' | 'llama';

export interface AIModelConfig {
    model: AIModel;
    temperature: number;
    maxTokens?: number;
    topP?: number;
}

// Default configuration
const DEFAULT_CONFIG: AIModelConfig = {
    model: 'llama',
    temperature: 0.3,
    maxTokens: 2048,
    topP: 0.95
};

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY is not set in environment variables');
}

if (!process.env.HUGGINGFACE_API_KEY) {
    logger.warn('HUGGINGFACE_API_KEY is not set in environment variables');
}

// Get model configuration from environment or use default
export const getAIConfig = (): AIModelConfig => {
    const model = (process.env.AI_MODEL || DEFAULT_CONFIG.model) as AIModel;

    if (model === 'llama' && !process.env.HUGGINGFACE_API_KEY) {
        logger.warn('HUGGINGFACE_API_KEY not set, falling back to OpenAI');
        return { ...DEFAULT_CONFIG, model: 'openai' };
    }

    if (model === 'openai' && !process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required when using OpenAI model');
    }

    return {
        ...DEFAULT_CONFIG,
        model,
        temperature: Number(process.env.AI_TEMPERATURE) || DEFAULT_CONFIG.temperature,
        maxTokens: Number(process.env.AI_MAX_TOKENS) || DEFAULT_CONFIG.maxTokens,
        topP: Number(process.env.AI_TOP_P) || DEFAULT_CONFIG.topP
    };
}; 