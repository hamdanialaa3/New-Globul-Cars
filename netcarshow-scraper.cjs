// سكريبت Node.js لاستخراج بيانات السيارات من netcarshow.com
// يمكن تشغيله مباشرة من Node.js

const https = require('https');
const fs = require('fs');

class NetcarshowScraper {
  constructor() {
    this.baseUrl = 'https://www.netcarshow.com';
    this.allData = {
      makes: [],
      models: {},
      generations: {},
      bodyStyles: {},
      extractedAt: new Date().toISOString(),
      source: 'netcarshow.com',
      totalStats: {
        makes: 0,
        models: 0,
        generations: 0,
        bodyStyles: 0
      }
    };
  }

  // دالة لجلب صفحة HTML
  fetchPage(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });

      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  // استخراج الشركات من الصفحة الرئيسية
  async extractMakes() {
    console.log('📋 استخراج الشركات...');

    try {
      const html = await this.fetchPage(this.baseUrl);

      // البحث عن select الخاص بالشركات
      const makeSelectMatch = html.match(/<select[^>]*name="make"[^>]*>(.*?)<\/select>/s);
      if (!makeSelectMatch) {
        throw new Error('لم يتم العثور على قائمة الشركات');
      }

      const selectContent = makeSelectMatch[1];
      const optionMatches = selectContent.matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g);

      const makes = [];
      for (const match of optionMatches) {
        const value = match[1];
        const text = match[2].trim();

        if (value && value !== '' && text) {
          makes.push({
            id: value.toLowerCase(),
            name: text
          });
        }
      }

      this.allData.makes = makes;
      this.allData.totalStats.makes = makes.length;

      console.log(`✅ تم استخراج ${makes.length} شركة`);
      return makes;

    } catch (error) {
      console.error('❌ خطأ في استخراج الشركات:', error.message);
      return [];
    }
  }

  // استخراج الموديلات لشركة معينة
  async extractModelsForMake(make) {
    console.log(`🚗 استخراج موديلات ${make.name}...`);

    try {
      // محاولة زيارة صفحة الشركة
      const makeUrl = `${this.baseUrl}/${make.id}/`;
      const html = await this.fetchPage(makeUrl);

      // استخراج الموديلات من الروابط
      const modelLinks = [];
      const linkRegex = /href="([^"]*\/model\/[^"]*)"[^>]*>([^<]*)/g;
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].trim();

        if (href && text) {
          const modelMatch = href.match(/\/model\/([^\/]+)\/?$/);
          if (modelMatch) {
            modelLinks.push({
              id: modelMatch[1],
              name: text,
              url: href
            });
          }
        }
      }

      // إزالة التكرارات
      const uniqueModels = modelLinks.filter((model, index, self) =>
        index === self.findIndex(m => m.id === model.id)
      );

      this.allData.models[make.id] = uniqueModels.map(model => ({
        id: model.id,
        name: model.name
      }));

      this.allData.totalStats.models += uniqueModels.length;

      console.log(`✅ تم استخراج ${uniqueModels.length} موديل لشركة ${make.name}`);
      return uniqueModels;

    } catch (error) {
      console.error(`❌ خطأ في استخراج موديلات ${make.name}:`, error.message);
      return [];
    }
  }

  // حفظ البيانات
  saveData() {
    const formattedData = this.formatDataForImport();

    const fileName = `netcarshow-data-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(fileName, JSON.stringify(formattedData, null, 2));

    console.log(`💾 تم حفظ البيانات في ملف: ${fileName}`);
    console.log('📊 إحصائيات البيانات:', this.allData.totalStats);
  }

  // تنسيق البيانات للاستيراد
  formatDataForImport() {
    const formatted = [];

    this.allData.makes.forEach(make => {
      const makeData = {
        id: make.id,
        name: make.name,
        models: []
      };

      if (this.allData.models[make.id]) {
        this.allData.models[make.id].forEach(model => {
          const modelData = {
            id: model.id,
            name: model.name,
            generations: [
              {
                id: `${model.id}-default`,
                name: 'Default',
                years: '2020-2024',
                bodyStyles: [
                  { id: 'sedan', name: 'Sedan' },
                  { id: 'suv', name: 'SUV' },
                  { id: 'hatchback', name: 'Hatchback' },
                  { id: 'coupe', name: 'Coupe' }
                ]
              }
            ]
          };

          makeData.models.push(modelData);
        });
      }

      formatted.push(makeData);
    });

    return formatted;
  }

  // تشغيل الاستخراج الكامل
  async run() {
    console.log('🚗🔍 بدء استخراج البيانات من netcarshow.com...');

    // استخراج الشركات
    const makes = await this.extractMakes();

    if (makes.length === 0) {
      console.error('❌ لم يتم استخراج أي شركات');
      return;
    }

    // استخراج الموديلات لكل شركة (مع فترات انتظار)
    for (let i = 0; i < Math.min(makes.length, 5); i++) { // استخراج أول 5 شركات فقط للتجربة
      const make = makes[i];
      await this.extractModelsForMake(make);

      // انتظار بين الطلبات
      if (i < makes.length - 1) {
        console.log('⏳ انتظار 2 ثانية...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // حفظ البيانات
    this.saveData();

    console.log('🎉 انتهى الاستخراج!');
  }
}

// تشغيل السكريبت
const scraper = new NetcarshowScraper();
scraper.run().catch(console.error);