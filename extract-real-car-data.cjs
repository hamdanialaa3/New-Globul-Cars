// استخراج البيانات الحقيقية من netcarshow.com باستخدام HTML parsing
// يقوم بجلب بيانات السيارات الحقيقية من موقع netcarshow.com

const https = require('https');
const fs = require('fs');

// قائمة الشركات المصنعة (فقط الشركات التي لها صفحات على netcarshow.com)
const manufacturers = [
  { id: 'acura', name: 'Acura' },
  { id: 'alfa_romeo', name: 'Alfa Romeo' },
  { id: 'alpine', name: 'Alpine' },
  { id: 'aston_martin', name: 'Aston Martin' },
  { id: 'audi', name: 'Audi' },
  { id: 'bmw', name: 'BMW' },
  { id: 'bentley', name: 'Bentley' },
  { id: 'bugatti', name: 'Bugatti' },
  { id: 'ferrari', name: 'Ferrari' },
  { id: 'ford', name: 'Ford' },
  { id: 'lamborghini', name: 'Lamborghini' },
  { id: 'maserati', name: 'Maserati' },
  { id: 'mclaren', name: 'McLaren' },
  { id: 'mercedes-benz', name: 'Mercedes-Benz' },
  { id: 'porsche', name: 'Porsche' },
  { id: 'rolls-royce', name: 'Rolls-Royce' },
  { id: 'tesla', name: 'Tesla' },
  { id: 'toyota', name: 'Toyota' }
];

// دالة لجلب محتوى صفحة ويب
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// دالة لتحليل HTML البسيط لاستخراج السيارات
function parseCarsFromHTML(html, manufacturerId) {
  const cars = [];

  // طباعة عينة من HTML للتصحيح (فقط لشركة BMW)
  if (manufacturerId === 'bmw') {
    console.log(`🔍 عينة من HTML لشركة ${manufacturerId}:`);
    console.log(html.substring(0, 2000));
    console.log('---');
  }

  // البحث عن نمط HTML الحقيقي: div.swTL مع السنة، ثم div.swBL مع الرابط
  // مثال:
  // <div class="swTL">2025</div>...<div class="swBL"><div class="swLB"><a href="/bmw/2025-x7/">BMW X7</a>
  const carRegex = new RegExp(`<div class="swTL">(\\d{4})</div>[\\s\\S]*?<div class="swBL">[\\s\\S]*?<a href="/${manufacturerId}/([^"]+)">([^<]+)</a>`, 'g');
  let match;
  let matchCount = 0;

  while ((match = carRegex.exec(html)) !== null) {
    matchCount++;
    if (manufacturerId === 'bmw') {
      console.log(`✅ تم العثور على تطابق ${matchCount}: Year=${match[1]}, URL=/${manufacturerId}/${match[2]}, Title=${match[3]}`);
    }

    const year = match[1];
    const url = `/${manufacturerId}/${match[2]}`;
    const title = match[3].trim();    // تجاهل السيارات المفاهيمية والنسخ الخاصة
    if (title.toLowerCase().includes('concept') ||
        title.toLowerCase().includes('study') ||
        title.toLowerCase().includes('show car')) {
      continue;
    }

    // استخراج اسم الموديل من العنوان والرابط
    let modelName = title.replace(/^\d{4}\s+/, '').replace(/\s*\([^)]*\)$/, '');

    // استخراج اسم الموديل من URL إذا لم يكن العنوان واضحاً
    if (url.includes('/')) {
      const urlParts = url.split('/').filter(p => p);
      if (urlParts.length >= 2) {
        const urlModel = urlParts[1].replace(/-/g, ' ').replace(/_/g, ' ');
        // استخدم اسم الموديل من URL إذا كان العنوان يحتوي على اسم الشركة
        if (title.toLowerCase().includes(manufacturerId.toLowerCase())) {
          modelName = urlModel;
        }
      }
    }

    // تحديد نوع الجسم بناءً على الموديل
    let bodyStyle = 'Sedan'; // افتراضي

    if (modelName.toLowerCase().includes('coupe')) {
      bodyStyle = 'Coupe';
      modelName = modelName.replace(/\s+coupe/i, '');
    } else if (modelName.toLowerCase().includes('sportback')) {
      bodyStyle = 'Hatchback';
      modelName = modelName.replace(/\s+sportback/i, '');
    } else if (modelName.toLowerCase().includes('avant') || modelName.toLowerCase().includes('wagon')) {
      bodyStyle = 'Wagon';
      modelName = modelName.replace(/\s+avant/i, '').replace(/\s+wagon/i, '');
    } else if (modelName.toLowerCase().includes('suv') ||
               modelName.toLowerCase().includes('q5') ||
               modelName.toLowerCase().includes('q7') ||
               modelName.toLowerCase().includes('q8') ||
               modelName.toLowerCase().includes('x5') ||
               modelName.toLowerCase().includes('x6') ||
               modelName.toLowerCase().includes('x3')) {
      bodyStyle = 'SUV';
    }

    // تنظيف اسم الموديل
    modelName = modelName.replace(/\s+/g, ' ').trim();    cars.push({
      year: parseInt(year),
      model: modelName,
      bodyStyle: bodyStyle,
      fullUrl: url
    });
  }

  if (manufacturerId === 'bmw') {
    console.log(`📊 تم العثور على ${matchCount} تطابقات للروابط`);
  }
  return cars;
}

// دالة لتجميع البيانات حسب الموديل والجيل
function groupCarsByModel(cars) {
  const models = {};

  cars.forEach(car => {
    const key = car.model.toLowerCase().replace(/\s+/g, '');

    if (!models[key]) {
      models[key] = {
        name: car.model,
        years: [],
        bodyStyles: new Set()
      };
    }

    models[key].years.push(car.year);
    models[key].bodyStyles.add(car.bodyStyle);
  });

  // تحويل إلى التنسيق المطلوب
  return Object.values(models).map(modelData => {
    const years = modelData.years.sort((a, b) => a - b);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;

    return {
      id: `${modelData.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: modelData.name,
      generations: [{
        id: `${modelData.name.toLowerCase().replace(/\s+/g, '_')}_gen_1`,
        name: 'Current Generation',
        years: yearRange,
        bodyStyles: Array.from(modelData.bodyStyles).map(style => ({
          id: style.toLowerCase(),
          name: style
        }))
      }]
    };
  });
}

// دالة لمعالجة شركة مصنعة واحدة
async function processManufacturer(manufacturer) {
  try {
    console.log(`🔍 جاري معالجة ${manufacturer.name}...`);

    const url = `https://www.netcarshow.com/${manufacturer.id}/`;
    const html = await fetchPage(url);

    const cars = parseCarsFromHTML(html, manufacturer.id);
    const models = groupCarsByModel(cars);

    console.log(`✅ تم العثور على ${models.length} موديل لشركة ${manufacturer.name}`);

    return {
      id: manufacturer.id,
      name: manufacturer.name,
      models: models
    };

  } catch (error) {
    console.error(`❌ خطأ في معالجة ${manufacturer.name}:`, error.message);
    return null;
  }
}

// الدالة الرئيسية
async function main() {
  console.log('🚗 بدء استخراج بيانات السيارات من netcarshow.com...\n');

  const results = [];

  for (const manufacturer of manufacturers) {
    const result = await processManufacturer(manufacturer);
    if (result) {
      results.push(result);
    }

    // انتظار قصير لتجنب حظر IP
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // حفظ النتائج
  fs.writeFileSync('netcarshow-car-data.json', JSON.stringify(results, null, 2));

  console.log(`\n✅ تم الانتهاء! تم حفظ ${results.length} شركة في netcarshow-car-data.json`);
  console.log('📊 ملخص النتائج:');

  results.forEach(make => {
    const totalModels = make.models.length;
    const totalCars = make.models.reduce((sum, model) => sum + model.generations.length, 0);
    console.log(`- ${make.name}: ${totalModels} موديل، ${totalCars} سيارة`);
  });
}

main().catch(console.error);