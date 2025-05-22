import { AIModel, AIModelConfig, getAIConfig } from '../config/ai';
import { analyzeCodeWithAI as analyzeWithOpenAI, refactorCodeWithAI as refactorWithOpenAI } from './openai';
import { analyzeCodeWithAI as analyzeWithLlama, refactorCodeWithAI as refactorWithLlama } from './llama';
import { logger } from './logger';

export interface AIAnalysisResult {
    style: string[];
    performance: string[];
    security: string[];
}

export interface AIRefactorResult {
    original: string;
    refactored: string;
    improvements: string[];
}

class AIFactory {
    private static instance: AIFactory;
    private config: AIModelConfig;

    private constructor() {
        this.config = getAIConfig();
    }

    public static getInstance(): AIFactory {
        if (!AIFactory.instance) {
            AIFactory.instance = new AIFactory();
        }
        return AIFactory.instance;
    }

    public setModel(model: AIModel): void {
        this.config = { ...this.config, model };
        logger.info(`AI model switched to: ${model}`);
    }

    public getCurrentModel(): AIModel {
        return this.config.model;
    }

    public async analyzeCode(code: string): Promise<AIAnalysisResult> {
        try {
            if (this.config.model === 'openai') {
                return await analyzeWithOpenAI(code);
            } else {
                return await analyzeWithLlama(code);
            }
        } catch (error) {
            logger.error(`Error in ${this.config.model} code analysis:`, error);
            throw error;
        }
    }

    public async refactorCode(code: string): Promise<AIRefactorResult> {
        try {
            if (this.config.model === 'openai') {
                return await refactorWithOpenAI(code);
            } else {
                return await refactorWithLlama(code);
            }
        } catch (error) {
            logger.error(`Error in ${this.config.model} code refactoring:`, error);
            throw error;
        }
    }
}

export const aiFactory = AIFactory.getInstance(); 