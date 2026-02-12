#!/usr/bin/env node
/**
 * Discover available Google Generative AI models for v1beta API
 * This script calls listModels() to see what's actually available
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAvailableModels() {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ REACT_APP_GEMINI_API_KEY environment variable not set');
      process.exit(1);
    }

    const ai = new GoogleGenerativeAI(apiKey);
    
    console.log('🔍 Discovering available Google Generative AI models for v1beta API...\n');
    
    // List all available models
    const models = await ai.listModels();
    
    console.log('✅ Available models:\n');
    
    let count = 0;
    const modelsByCategory = {
      'Vision/Multimodal': [],
      'Text': [],
      'Other': []
    };

    for await (const model of models) {
      count++;
      const modelName = model.name;
      const displayName = model.displayName;
      const supportedMethods = model.supportedGenerationMethods || [];
      
      // Categorize models
      if (displayName.toLowerCase().includes('vision') || modelName.includes('vision')) {
        modelsByCategory['Vision/Multimodal'].push(modelName);
      } else if (displayName.toLowerCase().includes('flash') || displayName.toLowerCase().includes('pro')) {
        modelsByCategory['Text'].push(modelName);
      } else {
        modelsByCategory['Other'].push(modelName);
      }
      
      console.log(`📌 Model: ${modelName}`);
      console.log(`   Display Name: ${displayName}`);
      console.log(`   Supported Methods: ${supportedMethods.join(', ')}`);
      console.log();
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY BY CATEGORY\n');
    
    Object.entries(modelsByCategory).forEach(([category, models]) => {
      if (models.length > 0) {
        console.log(`${category}:`);
        models.forEach(model => console.log(`  ✓ ${model}`));
        console.log();
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMMENDED MODEL NAMES FOR gemini-analysis.service.ts:\n');
    
    const textModels = modelsByCategory['Text'];
    const visionModels = modelsByCategory['Vision/Multimodal'];
    
    if (textModels.length > 0) {
      console.log('For text analysis (use first 2):');
      textModels.slice(0, 2).forEach((m, i) => console.log(`  ${i+1}. ${m}`));
    }
    
    if (visionModels.length > 0) {
      console.log('\nFor image analysis (use first 2):');
      visionModels.slice(0, 2).forEach((m, i) => console.log(`  ${i+1}. ${m}`));
    }
    
    console.log(`\n✅ Total models discovered: ${count}`);
    
  } catch (error) {
    console.error('❌ Error discovering models:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('   → Check that REACT_APP_GEMINI_API_KEY is valid');
    }
    process.exit(1);
  }
}

listAvailableModels();
