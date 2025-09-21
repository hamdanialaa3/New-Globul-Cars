# دليل استخراج البيانات السريع من netcarshow.com

## الهدف
نريد استخراج جميع بيانات السيارات (الشركات، الموديلات، الأجيال، أنواع الهيكل) من موقع netcarshow.com بنفس آلية البحث الموجودة في الموقع.

## الطريقة السريعة (موصى بها)

### الخطوة 1: اذهب إلى الموقع
افتح https://www.netcarshow.com/ في متصفحك

### الخطوة 2: افتح Developer Tools
- اضغط F12 أو Ctrl+Shift+I
- اذهب إلى تبويب Console

### الخطوة 3: انسخ الكود وألصقه
```javascript
// انسخ هذا الكود بالكامل والصقه في Console
function extractCompleteCarData() {
  console.log('🚗🔍 بدء استخراج شامل لبيانات السيارات من netcarshow.com...');

  const allData = {
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

  // استخراج الشركات
  function extractMakes() {
    console.log('📋 استخراج الشركات...');
    const makeSelect = document.querySelector('select[name="make"]');

    if (!makeSelect) {
      console.error('❌ لم يتم العثور على قائمة الشركات');
      return false;
    }

    const options = makeSelect.querySelectorAll('option');
    options.forEach(option => {
      if (option.value && option.value !== '') {
        allData.makes.push({
          id: option.value,
          name: option.text.trim()
        });
      }
    });

    allData.totalStats.makes = allData.makes.length;
    console.log(`✅ تم استخراج ${allData.makes.length} شركة`);
    return true;
  }

  // استخراج الموديلات لكل شركة
  function extractModelsForMake(make, makeIndex, callback) {
    console.log(`🚗 استخراج موديلات ${make.name} (${makeIndex + 1}/${allData.makes.length})...`);

    const makeSelect = document.querySelector('select[name="make"]');
    if (!makeSelect) return callback();

    makeSelect.value = make.id;
    const changeEvent = new Event('change', { bubbles: true });
    makeSelect.dispatchEvent(changeEvent);

    setTimeout(() => {
      const modelSelect = document.querySelector('select[name="model"]');
      if (modelSelect) {
        const modelOptions = modelSelect.querySelectorAll('option');
        const models = [];

        modelOptions.forEach(option => {
          if (option.value && option.value !== '') {
            models.push({
              id: option.value,
              name: option.text.trim()
            });
          }
        });

        allData.models[make.id] = models;
        allData.totalStats.models += models.length;
        console.log(`✅ تم استخراج ${models.length} موديل لشركة ${make.name}`);
      }

      callback();
    }, 1500);
  }

  // استخراج الأجيال لكل موديل
  function extractGenerationsForModel(make, model, modelIndex, callback) {
    console.log(`📅 استخراج أجيال ${model.name} (${modelIndex + 1}/${allData.models[make.id].length})...`);

    const modelSelect = document.querySelector('select[name="model"]');
    if (!modelSelect) return callback();

    modelSelect.value = model.id;
    const changeEvent = new Event('change', { bubbles: true });
    modelSelect.dispatchEvent(changeEvent);

    setTimeout(() => {
      const generationSelect = document.querySelector('select[name="generation"]');
      if (generationSelect) {
        const generationOptions = generationSelect.querySelectorAll('option');
        const generations = [];

        generationOptions.forEach(option => {
          if (option.value && option.value !== '') {
            generations.push({
              id: option.value,
              name: option.text.trim(),
              years: extractYearsFromText(option.text.trim())
            });
          }
        });

        if (!allData.generations[make.id]) {
          allData.generations[make.id] = {};
        }
        allData.generations[make.id][model.id] = generations;
        allData.totalStats.generations += generations.length;
        console.log(`✅ تم استخراج ${generations.length} جيل لموديل ${model.name}`);
      }

      callback();
    }, 1500);
  }

  // استخراج أنواع الهيكل لكل جيل
  function extractBodyStylesForGeneration(make, model, generation, genIndex, callback) {
    console.log(`🏗️ استخراج أنواع الهيكل لجيل ${generation.name} (${genIndex + 1}/${allData.generations[make.id][model.id].length})...`);

    const generationSelect = document.querySelector('select[name="generation"]');
    if (!generationSelect) return callback();

    generationSelect.value = generation.id;
    const changeEvent = new Event('change', { bubbles: true });
    generationSelect.dispatchEvent(changeEvent);

    setTimeout(() => {
      const bodyStyleSelect = document.querySelector('select[name="body"]');
      if (bodyStyleSelect) {
        const bodyStyleOptions = bodyStyleSelect.querySelectorAll('option');
        const bodyStyles = [];

        bodyStyleOptions.forEach(option => {
          if (option.value && option.value !== '') {
            bodyStyles.push({
              id: option.value,
              name: option.text.trim()
            });
          }
        });

        const key = `${make.id}_${model.id}_${generation.id}`;
        allData.bodyStyles[key] = bodyStyles;
        allData.totalStats.bodyStyles += bodyStyles.length;
        console.log(`✅ تم استخراج ${bodyStyles.length} نوع هيكل لجيل ${generation.name}`);
      }

      callback();
    }, 1500);
  }

  // دالة مساعدة لاستخراج السنوات
  function extractYearsFromText(text) {
    const yearMatch = text.match(/(\d{4})\s*-\s*(\d{4})/);
    if (yearMatch) {
      return `${yearMatch[1]}-${yearMatch[2]}`;
    }
    const singleYearMatch = text.match(/(\d{4})/);
    if (singleYearMatch) {
      return singleYearMatch[1];
    }
    return text;
  }

  // حفظ البيانات
  function saveData() {
    console.log('💾 حفظ البيانات...');

    const formattedData = formatDataForImport(allData);
    const dataStr = JSON.stringify(formattedData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'netcarshow-complete-car-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ تم حفظ البيانات في ملف JSON');
    console.log('📊 إحصائيات البيانات:', allData.totalStats);
    console.log('📋 البيانات المنسقة:', formattedData);
  }

  // تنسيق البيانات للاستيراد
  function formatDataForImport(data) {
    const formatted = [];

    data.makes.forEach(make => {
      const makeData = {
        id: make.id,
        name: make.name,
        models: []
      };

      if (data.models[make.id]) {
        data.models[make.id].forEach(model => {
          const modelData = {
            id: model.id,
            name: model.name,
            generations: []
          };

          if (data.generations[make.id] && data.generations[make.id][model.id]) {
            data.generations[make.id][model.id].forEach(generation => {
              const genData = {
                id: generation.id,
                name: generation.name,
                years: generation.years,
                bodyStyles: []
              };

              const key = `${make.id}_${model.id}_${generation.id}`;
              if (data.bodyStyles[key]) {
                genData.bodyStyles = data.bodyStyles[key];
              }

              modelData.generations.push(genData);
            });
          }

          makeData.models.push(modelData);
        });
      }

      formatted.push(makeData);
    });

    return formatted;
  }

  // تنفيذ الاستخراج
  if (!extractMakes()) {
    console.error('❌ فشل في استخراج الشركات');
    return;
  }

  let currentMakeIndex = 0;
  function processNextMake() {
    if (currentMakeIndex >= allData.makes.length) {
      console.log('🎉 انتهى استخراج جميع الموديلات!');
      saveData();
      return;
    }

    const make = allData.makes[currentMakeIndex];
    extractModelsForMake(make, currentMakeIndex, () => {
      currentMakeIndex++;
      setTimeout(processNextMake, 500);
    });
  }

  setTimeout(() => {
    console.log('🚀 بدء استخراج الموديلات...');
    processNextMake();
  }, 1000);
}

extractCompleteCarData();
```

### الخطوة 4: انتظر النتائج
- السكريبت سيعمل تلقائياً ويحفظ الملف `netcarshow-complete-car-data.json`
- قد يستغرق الأمر وقتاً حسب عدد الشركات

### الخطوة 5: انسخ البيانات
افتح الملف المحفوظ وانسخ محتواه

### الخطوة 6: حدث التطبيق
في ملف `src/constants/carData.ts`، استبدل `CAR_DATA` بالبيانات المستخرجة:

```typescript
export const CAR_DATA: CarMake[] = [
  // الصق البيانات هنا
];
```

## بدائل أسرع

### لشركة واحدة فقط:
اذهب إلى صفحة الشركة (مثل https://www.netcarshow.com/bmw/) واستخدم `extract-single-make.js`

### لموديل واحد:
اذهب إلى صفحة الموديل (مثل https://www.netcarshow.com/bmw/i8/) واستخدم `extract-model-details.js`

## ملاحظات مهمة
- استخدم فترات انتظار لتجنب الحظر
- ابدأ بالشركات الرئيسية أولاً
- يمكن دمج البيانات لاحقاً باستخدام `mergeCarData`

## المساعدة
إذا واجهت مشاكل، تأكد من:
1. نسخ الكود كاملاً
2. التحقق من أن الموقع لم يتغير
3. تجربة السكريبتات على شركات مختلفة