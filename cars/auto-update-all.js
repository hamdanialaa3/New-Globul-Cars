import NetCarShowScraper from './scraper.js';
import fs from 'fs';
import path from 'path';

async function autoUpdateAllBrands() {
    const scraper = new NetCarShowScraper();

    console.log('🚀 بدء التحديث التلقائي الشامل لجميع العلامات التجارية...');
    console.log('⏰ هذا قد يستغرق ساعات أو أيام - سيتم الحفظ تلقائياً');

    // الحصول على جميع روابط العلامات التجارية
    const brandUrls = await scraper.getAllBrands();
    console.log(`📊 تم العثور على ${brandUrls.length} علامة تجارية`);

    let totalProcessed = 0;
    let totalWithSpecs = 0;

    // معالجة كل علامة تجارية
    for (let brandIndex = 0; brandIndex < brandUrls.length; brandIndex++) {
        const brandUrl = brandUrls[brandIndex];
        const brandName = brandUrl.split('/').filter(p => p && !p.includes('http')).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

        console.log(`\n🏭 [${brandIndex + 1}/${brandUrls.length}] معالجة ${brandName}...`);

        try {
            // الحصول على نماذج العلامة التجارية
            const { models } = await scraper.getBrandModels(brandUrl);
            console.log(`📋 ${models.length} سيارة في ${brandName}`);

            // التحقق من وجود مواصفات مسبقاً
            const brandFilePath = path.join(scraper.outputDir, `${brandName}.txt`);
            let existingSpecsCount = 0;

            if (fs.existsSync(brandFilePath)) {
                const content = fs.readFileSync(brandFilePath, 'utf8');
                existingSpecsCount = (content.match(/Engine:|Power:|Transmission:/g) || []).length;
            }

            if (existingSpecsCount >= models.length * 0.8) { // إذا كان 80% من السيارات لها مواصفات
                console.log(`✅ ${brandName} مكتمل (${existingSpecsCount}/${models.length}) - تم تخطيه`);
                totalWithSpecs += existingSpecsCount;
                continue;
            }

            console.log(`🔄 بدء إضافة المواصفات (${existingSpecsCount}/${models.length} موجود مسبقاً)...`);

            // معالجة السيارات المفقودة
            let processedThisBrand = 0;

            for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
                const model = models[modelIndex];

                // التحقق من وجود مواصفات لهذه السيارة
                if (fs.existsSync(brandFilePath)) {
                    const content = fs.readFileSync(brandFilePath, 'utf8');
                    const modelSection = content.substring(
                        content.indexOf(`- ${model.name}`),
                        content.indexOf('\n- ', content.indexOf(`- ${model.name}`) + 1) || content.length
                    );

                    if (modelSection.includes('  Engine:') || modelSection.includes('  Power:') || modelSection.includes('  Transmission:')) {
                        continue; // له مواصفات مسبقاً
                    }
                }

                // محاولة الحصول على المواصفات
                let success = false;
                let retryCount = 0;
                const maxRetries = 2;

                while (!success && retryCount < maxRetries) {
                    try {
                        const details = await scraper.getModelDetails(model.url);
                        if (details) {
                            model.details = details;
                            success = true;
                            processedThisBrand++;
                            totalProcessed++;
                        }
                    } catch (error) {
                        retryCount++;
                        console.log(`❌ فشل ${model.name} (محاولة ${retryCount}/${maxRetries})`);
                        if (retryCount < maxRetries) {
                            await scraper.delay(2000 * retryCount);
                        }
                    }
                }

                // حفظ كل 5 سيارات أو في النهاية
                if (processedThisBrand % 5 === 0 || modelIndex === models.length - 1) {
                    await scraper.saveBrandData(brandName, models);
                    console.log(`💾 تم الحفظ: ${brandName} (${processedThisBrand + existingSpecsCount}/${models.length})`);
                }

                // انتظار قصير بين السيارات
                await scraper.delay(800);
            }

            console.log(`✅ انتهى ${brandName}: ${processedThisBrand + existingSpecsCount}/${models.length} سيارة مع مواصفات`);

        } catch (error) {
            console.log(`❌ فشل في ${brandName}: ${error.message}`);
        }

        // انتظار بين العلامات التجارية
        await scraper.delay(2000);
    }

    console.log('\n🎉 انتهى التحديث التلقائي!');
    console.log(`📊 إجمالي السيارات المعالجة: ${totalProcessed}`);
    console.log(`📈 إجمالي السيارات مع مواصفات: ${totalWithSpecs + totalProcessed}`);
    console.log('✅ يمكنك الآن الذهاب لمهام أخرى - السكريبت يعمل تلقائياً');
}

autoUpdateAllBrands().catch(console.error);