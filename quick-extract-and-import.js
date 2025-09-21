// quick-extract-and-import.js
// سكريبت سريع لاستخراج البيانات وإنشاء كود الاستيراد الجاهز

// الخطوة 1: تشغيل أي من سكريبتات الاستخراج
// الخطوة 2: تشغيل هذا السكريبت لمعالجة البيانات

function processExtractedData() {
  console.log('🔄 معالجة البيانات المستخرجة...');

  // البحث عن البيانات في localStorage أو متغيرات أخرى
  let extractedData = null;

  // البحث في localStorage
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && data.makes && Array.isArray(data.makes)) {
        extractedData = data;
        console.log('✅ تم العثور على البيانات في localStorage:', key);
        break;
      }
    } catch (e) {
      // تجاهل الأخطاء
    }
  }

  // البحث في المتغيرات العامة
  if (!extractedData && window.extractedCarData) {
    extractedData = window.extractedCarData;
    console.log('✅ تم العثور على البيانات في window.extractedCarData');
  }

  if (!extractedData) {
    console.log('❌ لم يتم العثور على بيانات مستخرجة');
    console.log('💡 تأكد من تشغيل أحد سكريبتات الاستخراج أولاً');
    return;
  }

  // التحقق من صحة البيانات
  if (!validateData(extractedData)) {
    console.error('❌ البيانات غير صالحة');
    return;
  }

  // تحويل البيانات
  const carData = convertToCarDataFormat(extractedData);

  // إنشاء كود TypeScript
  const tsCode = generateTypeScriptCode(carData, extractedData);

  // عرض النتائج
  console.log('🎉 تم معالجة البيانات بنجاح!');
  console.log('📊 إحصائيات:', getDataStats(carData));
  console.log('📋 الكود الجاهز للاستيراد:');
  console.log(tsCode);

  // نسخ الكود إلى الحافظة
  if (navigator.clipboard) {
    navigator.clipboard.writeText(tsCode).then(() => {
      console.log('✅ تم نسخ الكود إلى الحافظة!');
    });
  }

  return tsCode;
}

function validateData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.makes)) return false;

  for (const make of data.makes) {
    if (!make.id || !make.name) return false;
    if (!Array.isArray(make.models)) return false;

    for (const model of make.models) {
      if (!model.id || !model.name) return false;
      if (!Array.isArray(model.generations)) return false;

      for (const generation of model.generations) {
        if (!generation.id || !generation.name) return false;
        if (!Array.isArray(generation.bodyStyles)) return false;

        for (const bodyStyle of generation.bodyStyles) {
          if (!bodyStyle.id || !bodyStyle.name) return false;
        }
      }
    }
  }

  return true;
}

function convertToCarDataFormat(extractedData) {
  return extractedData.makes.map(make => ({
    id: make.id,
    name: make.name,
    models: make.models.map(model => ({
      id: model.id,
      name: model.name,
      generations: model.generations.map(generation => ({
        id: generation.id,
        name: generation.name,
        years: generation.years || '',
        bodyStyles: generation.bodyStyles
      }))
    }))
  }));
}

function generateTypeScriptCode(carData, originalData) {
  const stats = getDataStats(carData);

  return `// البيانات المستخرجة من netcarshow.com في ${originalData.extractedAt || new Date().toISOString()}
// المصدر: ${originalData.source || 'netcarshow.com'}

export const EXTRACTED_CAR_DATA = ${JSON.stringify(carData, null, 2)};

// إحصائيات البيانات:
export const DATA_STATS = {
  makes: ${stats.makes},
  models: ${stats.models},
  generations: ${stats.generations},
  bodyStyles: ${stats.bodyStyles}
};

console.log('تم تحميل بيانات السيارات:', DATA_STATS);
`;
}

function getDataStats(carData) {
  const stats = {
    makes: carData.length,
    models: 0,
    generations: 0,
    bodyStyles: 0
  };

  carData.forEach(make => {
    stats.models += make.models.length;
    make.models.forEach(model => {
      stats.generations += model.generations.length;
      model.generations.forEach(generation => {
        stats.bodyStyles += generation.bodyStyles.length;
      });
    });
  });

  return stats;
}

// تشغيل المعالجة
processExtractedData();