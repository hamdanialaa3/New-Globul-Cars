import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📊 محلل أسماء الملفات - عرض نظام التسمية الذكية
class FilenameAnalyzer {
    constructor() {
        this.brandDir = path.join(__dirname, 'brand_directories');
    }

    // تحليل اسم ملف واحد
    analyzeFilename(filename) {
        // إزالة امتداد الملف
        const nameOnly = filename.replace(/\.[^/.]+$/, "");
        
        // تقسيم الأجزاء
        const parts = nameOnly.split('_');
        
        if (parts.length >= 4) {
            const analysis = {
                original: filename,
                model: parts[0] || 'Unknown',
                trim: parts[1] || 'Standard', 
                generation: parts.slice(2, -2).join('_') || 'Current',
                year: parts[parts.length - 2] || new Date().getFullYear().toString(),
                serial: parts[parts.length - 1] || '001'
            };
            
            return analysis;
        }
        
        return {
            original: filename,
            model: 'Unknown',
            trim: 'Standard',
            generation: 'Current',
            year: new Date().getFullYear().toString(),
            serial: '001',
            note: 'Format not recognized'
        };
    }

    // تحليل ملفات علامة تجارية
    async analyzeBrand(brandName) {
        const brandPath = path.join(this.brandDir, brandName);
        
        try {
            const files = await fs.readdir(brandPath);
            const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
            
            console.log(`\n🔍 تحليل ملفات ${brandName}`);
            console.log(`📁 المسار: ${brandPath}`);
            console.log(`📊 عدد الصور: ${imageFiles.length}`);
            console.log('─'.repeat(80));
            
            const analyses = [];
            
            imageFiles.forEach((file, index) => {
                const analysis = this.analyzeFilename(file);
                analyses.push(analysis);
                
                if (index < 10) { // عرض أول 10 ملفات فقط
                    console.log(`📝 ${file}`);
                    console.log(`   🚗 الموديل: ${analysis.model}`);
                    console.log(`   🏷️  الفئة: ${analysis.trim}`);
                    console.log(`   🔄 الجيل: ${analysis.generation}`);
                    console.log(`   📅 السنة: ${analysis.year}`);
                    console.log(`   #️⃣  الرقم: ${analysis.serial}`);
                    if (analysis.note) console.log(`   ⚠️  ملاحظة: ${analysis.note}`);
                    console.log('');
                }
            });
            
            if (imageFiles.length > 10) {
                console.log(`... و ${imageFiles.length - 10} ملف إضافي\n`);
            }
            
            return analyses;
            
        } catch (error) {
            console.log(`❌ خطأ في تحليل ${brandName}: ${error.message}`);
            return [];
        }
    }

    // إحصائيات شاملة
    async generateStats() {
        try {
            const brands = await fs.readdir(this.brandDir);
            const validBrands = [];
            
            console.log('📊 إحصائيات نظام التسمية الذكية');
            console.log('═'.repeat(80));
            console.log('📝 الصيغة المستخدمة: الموديل_الفئة_الجيل_سنة الصنع_رقم');
            console.log('🌍 مثال: Civic_SI_Latest_Gen_2024_001.jpg');
            console.log('═'.repeat(80));
            
            let totalFiles = 0;
            const modelStats = {};
            const trimStats = {};
            const yearStats = {};
            const generationStats = {};
            
            for (const brand of brands) {
                const brandPath = path.join(this.brandDir, brand);
                const stat = await fs.stat(brandPath);
                
                if (stat.isDirectory()) {
                    try {
                        const files = await fs.readdir(brandPath);
                        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
                        
                        if (imageFiles.length > 0) {
                            validBrands.push({ name: brand, count: imageFiles.length });
                            totalFiles += imageFiles.length;
                            
                            // تحليل الأسماء
                            imageFiles.forEach(file => {
                                const analysis = this.analyzeFilename(file);
                                
                                // إحصائيات الموديلات
                                if (!modelStats[analysis.model]) modelStats[analysis.model] = 0;
                                modelStats[analysis.model]++;
                                
                                // إحصائيات الفئات
                                if (!trimStats[analysis.trim]) trimStats[analysis.trim] = 0;
                                trimStats[analysis.trim]++;
                                
                                // إحصائيات السنوات
                                if (!yearStats[analysis.year]) yearStats[analysis.year] = 0;
                                yearStats[analysis.year]++;
                                
                                // إحصائيات الأجيال
                                if (!generationStats[analysis.generation]) generationStats[analysis.generation] = 0;
                                generationStats[analysis.generation]++;
                            });
                        }
                    } catch (error) {
                        console.log(`⚠️  تخطي ${brand}: ${error.message}`);
                    }
                }
            }
            
            // عرض الإحصائيات
            console.log(`🏭 إجمالي العلامات التجارية: ${validBrands.length}`);
            console.log(`📸 إجمالي الصور: ${totalFiles}`);
            console.log('');
            
            // أشهر الموديلات
            console.log('🚗 أشهر الموديلات:');
            Object.entries(modelStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .forEach(([model, count]) => {
                    console.log(`   ${model}: ${count} صورة`);
                });
            
            console.log('');
            
            // أشهر الفئات
            console.log('🏷️  أشهر الفئات:');
            Object.entries(trimStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .forEach(([trim, count]) => {
                    console.log(`   ${trim}: ${count} صورة`);
                });
            
            console.log('');
            
            // توزيع السنوات
            console.log('📅 توزيع السنوات:');
            Object.entries(yearStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .forEach(([year, count]) => {
                    console.log(`   ${year}: ${count} صورة`);
                });
            
            console.log('');
            
            // توزيع الأجيال
            console.log('🔄 توزيع الأجيال:');
            Object.entries(generationStats)
                .sort(([,a], [,b]) => b - a)
                .forEach(([generation, count]) => {
                    console.log(`   ${generation}: ${count} صورة`);
                });
            
            console.log('');
            
            // أكثر العلامات نشاطاً
            console.log('🏆 أكثر العلامات نشاطاً:');
            validBrands
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .forEach((brand, index) => {
                    console.log(`   ${index + 1}. ${brand.name}: ${brand.count} صورة`);
                });
            
            return {
                totalBrands: validBrands.length,
                totalFiles,
                modelStats,
                trimStats,
                yearStats,
                generationStats,
                topBrands: validBrands.sort((a, b) => b.count - a.count)
            };
            
        } catch (error) {
            console.log(`❌ خطأ في تحليل الإحصائيات: ${error.message}`);
            return null;
        }
    }

    // تحليل سريع لعلامة واحدة
    async quickAnalysis(brandName) {
        console.log(`⚡ تحليل سريع لـ ${brandName}`);
        const result = await this.analyzeBrand(brandName);
        return result;
    }
}

export default FilenameAnalyzer;