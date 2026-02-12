/**
 * Project Knowledge Service
 * خدمة معرفة المشروع - RAG System
 * 
 * يستخدم قاعدة المعرفة المُنشأة من train-ai-on-project.js
 * لتوفير سياق ذكي للـ AI Chatbot
 */

import { logger } from '../logger-service';

// هيكل قاعدة المعرفة
interface ProjectFile {
  path: string;
  type: string;
  size: number;
  lines: number;
  contentHash: string;
  summary: {
    description: string;
    preview: string;
    lines: number;
  };
  analysis: {
    type: string;
    functions?: string[];
    classes?: string[];
    interfaces?: string[];
    exports?: string[];
    comments?: string[];
    headers?: string[];
  };
  keywords: string[];
  lastModified: string;
}

interface KnowledgeBase {
  version: string;
  generatedAt: string;
  project: {
    name: string;
    description: string;
    path: string;
  };
  summary: {
    totalFiles: number;
    totalLines: number;
    totalSize: number;
    fileTypes: Record<string, number>;
    topDirectories: Record<string, number>;
    topKeywords: Array<{ keyword: string; count: number }>;
    codeStats: {
      totalFunctions: number;
      totalClasses: number;
      totalInterfaces: number;
    };
  };
  files: ProjectFile[];
  searchIndex: {
    byType: Record<string, number[]>;
    byKeyword: Record<string, number[]>;
    byDirectory: Record<string, number[]>;
  };
}

interface SearchResult {
  file: ProjectFile;
  relevanceScore: number;
  matchReason: string;
}

class ProjectKnowledgeService {
  private static instance: ProjectKnowledgeService;
  private knowledgeBase: KnowledgeBase | null = null;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): ProjectKnowledgeService {
    if (!this.instance) {
      this.instance = new ProjectKnowledgeService();
    }
    return this.instance;
  }

  /**
   * تحميل قاعدة المعرفة من الملف
   */
  async loadKnowledgeBase(): Promise<boolean> {
    if (this.isLoaded && this.knowledgeBase) {
      return true;
    }

    try {
      // في production، نحمل من public/data/
      const response = await fetch('/data/project-knowledge.json');
      
      if (!response.ok) {
        logger.warn('Knowledge base not found. Run: npm run train-ai');
        return false;
      }

      this.knowledgeBase = await response.json();
      this.isLoaded = true;

      logger.info('Knowledge base loaded successfully', {
        version: this.knowledgeBase.version,
        files: this.knowledgeBase.files.length,
        totalLines: this.knowledgeBase.summary.totalLines
      });

      return true;
    } catch (error) {
      logger.error('Failed to load knowledge base', error as Error);
      return false;
    }
  }

  /**
   * البحث في قاعدة المعرفة
   */
  async search(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    if (!this.isLoaded || !this.knowledgeBase) {
      await this.loadKnowledgeBase();
      if (!this.knowledgeBase) return [];
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    const results: SearchResult[] = [];

    // البحث في الملفات
    this.knowledgeBase.files.forEach(file => {
      let score = 0;
      const reasons: string[] = [];

      // تطابق اسم الملف
      if (file.path.toLowerCase().includes(queryLower)) {
        score += 50;
        reasons.push('file path match');
      }

      // تطابق الكلمات المفتاحية
      const matchingKeywords = file.keywords.filter(k => 
        queryWords.includes(k.toLowerCase())
      );
      score += matchingKeywords.length * 20;
      if (matchingKeywords.length > 0) {
        reasons.push(`keywords: ${matchingKeywords.join(', ')}`);
      }

      // تطابق الوصف
      if (file.summary.description.toLowerCase().includes(queryLower)) {
        score += 30;
        reasons.push('description match');
      }

      // تطابق الدوال/Classes
      if (file.analysis.functions) {
        const matchingFuncs = file.analysis.functions.filter(f =>
          f.toLowerCase().includes(queryLower)
        );
        score += matchingFuncs.length * 15;
        if (matchingFuncs.length > 0) {
          reasons.push(`functions: ${matchingFuncs.slice(0, 3).join(', ')}`);
        }
      }

      if (file.analysis.classes) {
        const matchingClasses = file.analysis.classes.filter(c =>
          c.toLowerCase().includes(queryLower)
        );
        score += matchingClasses.length * 15;
        if (matchingClasses.length > 0) {
          reasons.push(`classes: ${matchingClasses.slice(0, 3).join(', ')}`);
        }
      }

      // تطابق التعليقات
      if (file.analysis.comments) {
        const matchingComments = file.analysis.comments.filter(c =>
          c.toLowerCase().includes(queryLower)
        );
        score += matchingComments.length * 10;
      }

      if (score > 0) {
        results.push({
          file,
          relevanceScore: score,
          matchReason: reasons.join(' | ')
        });
      }
    });

    // ترتيب حسب الصلة
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results.slice(0, maxResults);
  }

  /**
   * الحصول على ملفات حسب الكلمة المفتاحية
   */
  getFilesByKeyword(keyword: string): ProjectFile[] {
    if (!this.knowledgeBase) return [];

    const indices = this.knowledgeBase.searchIndex.byKeyword[keyword.toLowerCase()];
    if (!indices) return [];

    return indices
      .map(idx => this.knowledgeBase!.files[idx])
      .slice(0, 10);
  }

  /**
   * الحصول على ملفات حسب النوع
   */
  getFilesByType(type: string): ProjectFile[] {
    if (!this.knowledgeBase) return [];

    const indices = this.knowledgeBase.searchIndex.byType[type];
    if (!indices) return [];

    return indices.map(idx => this.knowledgeBase!.files[idx]);
  }

  /**
   * الحصول على ملفات حسب المجلد
   */
  getFilesByDirectory(directory: string): ProjectFile[] {
    if (!this.knowledgeBase) return [];

    const indices = this.knowledgeBase.searchIndex.byDirectory[directory];
    if (!indices) return [];

    return indices.map(idx => this.knowledgeBase!.files[idx]);
  }

  /**
   * بناء سياق للـ AI من نتائج البحث
   */
  buildContextFromResults(results: SearchResult[], maxTokens: number = 2000): string {
    if (results.length === 0) {
      return '';
    }

    let context = '📚 معلومات من قاعدة معرفة المشروع:\n\n';
    let currentTokens = 0;

    for (const result of results) {
      const fileContext = `
📄 الملف: ${result.file.path}
📝 الوصف: ${result.file.summary.description}
🔍 السبب: ${result.matchReason}
⚙️ التفاصيل:
${result.file.analysis.functions ? `  • دوال: ${result.file.analysis.functions.slice(0, 5).join(', ')}` : ''}
${result.file.analysis.classes ? `  • Classes: ${result.file.analysis.classes.slice(0, 3).join(', ')}` : ''}
${result.file.analysis.exports ? `  • Exports: ${result.file.analysis.exports.slice(0, 5).join(', ')}` : ''}

معاينة الكود:
\`\`\`${result.file.type.slice(1)}
${result.file.summary.preview.slice(0, 500)}
\`\`\`

---
`;

      const estimatedTokens = fileContext.length / 4; // تقدير تقريبي
      if (currentTokens + estimatedTokens > maxTokens) {
        break;
      }

      context += fileContext;
      currentTokens += estimatedTokens;
    }

    return context;
  }

  /**
   * الحصول على ملخص المشروع
   */
  getProjectSummary(): string {
    if (!this.knowledgeBase) {
      return 'قاعدة المعرفة غير محملة';
    }

    const { summary } = this.knowledgeBase;
    
    return `
📊 ملخص المشروع: ${this.knowledgeBase.project.name}

📁 الملفات: ${summary.totalFiles.toLocaleString()}
📝 الأسطر: ${summary.totalLines.toLocaleString()}
💾 الحجم: ${(summary.totalSize / 1024 / 1024).toFixed(2)} MB

⚙️ إحصائيات الكود:
  • دوال: ${summary.codeStats.totalFunctions}
  • Classes: ${summary.codeStats.totalClasses}
  • Interfaces: ${summary.codeStats.totalInterfaces}

📂 أهم المجلدات:
${Object.entries(summary.topDirectories)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([dir, count]) => `  • ${dir}: ${count} ملف`)
  .join('\n')}

🏷️ الكلمات المفتاحية الأكثر شيوعاً:
${summary.topKeywords.slice(0, 10).map(k => `  • ${k.keyword} (${k.count})`).join('\n')}

📅 آخر تحديث: ${new Date(this.knowledgeBase.generatedAt).toLocaleString('ar-BG')}
`;
  }

  /**
   * البحث الذكي مع استخراج الكلمات المفتاحية
   */
  async intelligentSearch(userQuery: string): Promise<{
    results: SearchResult[];
    context: string;
    suggestions: string[];
  }> {
    // البحث الأساسي
    const results = await this.search(userQuery, 5);

    // بناء السياق
    const context = this.buildContextFromResults(results, 2000);

    // اقتراحات ذات صلة
    const suggestions: string[] = [];
    if (this.knowledgeBase) {
      const queryKeywords = userQuery.toLowerCase().split(/\s+/);
      
      this.knowledgeBase.summary.topKeywords.forEach(({ keyword }) => {
        if (queryKeywords.some(q => keyword.includes(q) || q.includes(keyword))) {
          suggestions.push(keyword);
        }
      });
    }

    return {
      results,
      context,
      suggestions: suggestions.slice(0, 5)
    };
  }

  /**
   * التحقق من وجود ملف/دالة/class
   */
  findByName(name: string): ProjectFile[] {
    if (!this.knowledgeBase) return [];

    const nameLower = name.toLowerCase();
    const matches: ProjectFile[] = [];

    this.knowledgeBase.files.forEach(file => {
      // تطابق اسم الملف
      if (file.path.toLowerCase().includes(nameLower)) {
        matches.push(file);
        return;
      }

      // تطابق الدوال
      if (file.analysis.functions?.some(f => 
        f.toLowerCase().includes(nameLower)
      )) {
        matches.push(file);
        return;
      }

      // تطابق Classes
      if (file.analysis.classes?.some(c => 
        c.toLowerCase().includes(nameLower)
      )) {
        matches.push(file);
        return;
      }

      // تطابق Interfaces
      if (file.analysis.interfaces?.some(i => 
        i.toLowerCase().includes(nameLower)
      )) {
        matches.push(file);
        return;
      }
    });

    return matches.slice(0, 10);
  }

  /**
   * إحصائيات الاستخدام
   */
  getStats() {
    return this.knowledgeBase?.summary || null;
  }

  /**
   * التحقق من جاهزية النظام
   */
  isReady(): boolean {
    return this.isLoaded && this.knowledgeBase !== null;
  }
}

// Singleton Export
export const projectKnowledgeService = ProjectKnowledgeService.getInstance();
export default projectKnowledgeService;
