/**
 * AI Pipeline Orchestrator
 * المنسق الرئيسي لخط أنابيب الذكاء الاصطناعي
 * 
 * يجمع:
 * 1. فحص الوسائط مسبقاً
 * 2. توليد المحتوى مع prompt قصير
 * 3. التحقق من المخرجات بـ schema صارم
 * 4. إعادة المحاولة الذكية
 * 5. جمع المقاييس
 * 
 * النتيجة: 2-3 خطوات بدلاً من 10+
 */

import { AdGenerationInput, AdGenerationOutput } from './schemas/ad-generation.schema';
import { validateAdOutput, validateAndFix } from './validators/ad-schema.validator';
import { preCheckAllMedia } from './media-precheck.service';
import { withSmartRetry, classifyError, shouldEscalate } from './smart-retry.service';
import { buildCompletePrompt, estimateTokens, validatePromptSize } from './prompt-templates.service';
import { aiMetrics } from './ai-metrics.service';
import { aiRouterService } from './ai-router.service';
import { logger } from '../logger-service';

export interface PipelineResult {
  success: boolean;
  output?: AdGenerationOutput;
  errors: string[];
  warnings: string[];
  metrics: {
    totalTimeMs: number;
    mediaCheckTimeMs: number;
    llmTimeMs: number;
    validationTimeMs: number;
    retryCount: number;
    tokensUsed: number;
  };
  requiresReview: boolean;
  reviewReason?: string;
}

export interface PipelineOptions {
  language?: 'bg' | 'en';
  skipMediaCheck?: boolean;
  maxRetries?: number;
  includeExample?: boolean;
  forceProvider?: 'gemini' | 'deepseek';
}

/**
 * Main AI content generation pipeline
 */
export async function runAdGenerationPipeline(
  input: AdGenerationInput,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  let mediaCheckTimeMs = 0;
  let llmTimeMs = 0;
  let validationTimeMs = 0;
  let retryCount = 0;
  let tokensUsed = 0;
  
  logger.info('Starting ad generation pipeline', { 
    vehicleId: input.vehicleId,
    make: input.make,
    model: input.model 
  });
  
  // ============================================
  // STEP 1: Media Pre-Check (skip LLM if media fails)
  // ============================================
  if (!options.skipMediaCheck && input.images.length > 0) {
    const mediaStart = Date.now();
    
    const mediaResult = await preCheckAllMedia(input.images);
    mediaCheckTimeMs = Date.now() - mediaStart;
    
    // Record metrics
    aiMetrics.recordMediaCheck({
      totalUrls: mediaResult.summary.total,
      validCount: mediaResult.summary.valid,
      failedCount: mediaResult.summary.invalid,
      failures: Object.entries(mediaResult.summary.errors).map(([type]) => ({ type, count: 1 })),
      totalCheckTimeMs: mediaCheckTimeMs
    });
    
    // Fail fast if no valid images
    if (mediaResult.summary.valid === 0) {
      errors.push('No valid images available - cannot proceed');
      errors.push(...mediaResult.summary.errors);
      
      return {
        success: false,
        errors,
        warnings,
        metrics: {
          totalTimeMs: Date.now() - startTime,
          mediaCheckTimeMs,
          llmTimeMs: 0,
          validationTimeMs: 0,
          retryCount: 0,
          tokensUsed: 0
        },
        requiresReview: true,
        reviewReason: 'All images failed pre-check'
      };
    }
    
    // Add warnings for failed images
    if (mediaResult.summary.invalid > 0) {
      warnings.push(`${mediaResult.summary.invalid} images failed pre-check and will be skipped`);
    }
    
    // Update input with only valid images
    input = { ...input, images: mediaResult.validUrls };
  }
  
  // ============================================
  // STEP 2: Build Short Prompt
  // ============================================
  const { system, user } = buildCompletePrompt(input, {
    language: options.language || 'bg',
    includeExample: options.includeExample
  });
  
  // Validate prompt size
  const promptValidation = validatePromptSize(system, user);
  if (!promptValidation.valid) {
    errors.push(promptValidation.warning || 'Prompt too long');
    return {
      success: false,
      errors,
      warnings,
      metrics: {
        totalTimeMs: Date.now() - startTime,
        mediaCheckTimeMs,
        llmTimeMs: 0,
        validationTimeMs: 0,
        retryCount: 0,
        tokensUsed: 0
      },
      requiresReview: true,
      reviewReason: 'Prompt size exceeded limits'
    };
  }
  
  if (promptValidation.warning) {
    warnings.push(promptValidation.warning);
  }
  
  // ============================================
  // STEP 3: LLM Call with Smart Retry
  // ============================================
  const llmStart = Date.now();
  
  const llmResult = await withSmartRetry(
    async () => {
      // Use AI router to select provider
      const response = await aiRouterService.generateVehicleDescription(
        {
          make: input.make,
          model: input.model,
          year: input.year,
          fuelType: input.fuelType,
          transmission: input.transmission,
          mileage: input.mileage,
          power: input.power,
          equipment: input.equipment
        },
        {
          language: options.language || 'bg',
          userType: input.sellerType === 'company' ? 'company' : 'private',
          forceProvider: options.forceProvider
        }
      );
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    },
    {
      operationName: 'LLM generation',
      maxRetries: options.maxRetries ?? 2,
      onRetry: (attempt, error, delay) => {
        retryCount = attempt;
        warnings.push(`Retry ${attempt}: ${error.message} (waiting ${delay}ms)`);
      },
      onPermanentError: (error, classification) => {
        errors.push(`Permanent error: ${error.message}`);
        if (classification.escalate) {
          errors.push('⚠️ This error requires admin attention');
        }
      }
    }
  );
  
  llmTimeMs = Date.now() - llmStart;
  retryCount = llmResult.state.attemptCount - 1;
  
  // Record latency metrics
  aiMetrics.recordLatency({
    provider: options.forceProvider || 'deepseek',
    operationType: 'ad_generation',
    latencyMs: llmTimeMs,
    tokensUsed: estimateTokens(system + user),
    wasTimeout: llmResult.classification?.category === 'transient',
    wasSuccessful: llmResult.state.wasSuccessful
  });
  
  // Record retry metrics
  aiMetrics.recordRetry({
    operationName: 'ad_generation',
    attemptCount: llmResult.state.attemptCount,
    wasSuccessful: llmResult.state.wasSuccessful,
    totalDelayMs: llmResult.state.totalDelayMs,
    errorCategory: llmResult.classification?.category
  });
  
  if (!llmResult.result) {
    return {
      success: false,
      errors,
      warnings,
      metrics: {
        totalTimeMs: Date.now() - startTime,
        mediaCheckTimeMs,
        llmTimeMs,
        validationTimeMs: 0,
        retryCount,
        tokensUsed
      },
      requiresReview: shouldEscalate(llmResult.state.lastError || ''),
      reviewReason: llmResult.state.lastError?.message
    };
  }
  
  // ============================================
  // STEP 4: Schema Validation with Auto-Fix
  // ============================================
  const validationStart = Date.now();
  
  const validation = validateAndFix(llmResult.result);
  validationTimeMs = Date.now() - validationStart;
  
  // Record validation metrics
  aiMetrics.recordValidation({
    passed: validation.valid,
    errorCount: validation.errors.length,
    fixAttempts: validation.fixed ? 1 : 0,
    processingTimeMs: validationTimeMs
  });
  
  if (!validation.valid) {
    const errorMessages = validation.errors.slice(0, 5).map(e => `${e.path}: ${e.message}`);
    errors.push('Schema validation failed:', ...errorMessages);
    
    return {
      success: false,
      errors,
      warnings,
      metrics: {
        totalTimeMs: Date.now() - startTime,
        mediaCheckTimeMs,
        llmTimeMs,
        validationTimeMs,
        retryCount,
        tokensUsed
      },
      requiresReview: true,
      reviewReason: 'Output failed schema validation'
    };
  }
  
  if (validation.fixed) {
    warnings.push('Output was auto-fixed to pass schema validation');
  }
  
  // ============================================
  // STEP 5: Quality Check & Finalize
  // ============================================
  const output = validation.result!;
  
  // Update metadata
  output.meta = {
    ...output.meta,
    processingTimeMs: Date.now() - startTime,
    retryCount
  };
  
  tokensUsed = output.meta.tokensUsed || estimateTokens(system + user);
  
  // Check if requires review
  const requiresReview = output.quality.requiresReview || output.quality.score < 70;
  
  logger.info('Ad generation pipeline completed', {
    success: true,
    vehicleId: input.vehicleId,
    qualityScore: output.quality.score,
    requiresReview,
    totalTimeMs: Date.now() - startTime
  });
  
  return {
    success: true,
    output,
    errors,
    warnings,
    metrics: {
      totalTimeMs: Date.now() - startTime,
      mediaCheckTimeMs,
      llmTimeMs,
      validationTimeMs,
      retryCount,
      tokensUsed
    },
    requiresReview,
    reviewReason: requiresReview ? output.quality.reviewReason : undefined
  };
}

/**
 * Quick check - validates an existing output without regenerating
 */
export function validateExistingOutput(output: unknown): {
  valid: boolean;
  errors: string[];
  canAutoFix: boolean;
} {
  const result = validateAndFix(output);
  return {
    valid: result.valid,
    errors: result.errors.map(e => `${e.path}: ${e.message}`),
    canAutoFix: result.fixed && result.valid
  };
}

/**
 * Get pipeline health status
 */
export function getPipelineHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  metrics: ReturnType<typeof aiMetrics.getMetrics>;
} {
  const metrics = aiMetrics.getMetrics();
  const diagnostics = aiMetrics.getDiagnostics();
  
  const issues = diagnostics.filter(d => d.startsWith('⚠️'));
  
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (issues.length >= 3) {
    status = 'unhealthy';
  } else if (issues.length >= 1) {
    status = 'degraded';
  }
  
  return { status, issues, metrics };
}
