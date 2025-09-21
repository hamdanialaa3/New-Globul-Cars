// سكريبت لاستخراج بيانات موديل محدد مع الأجيال وأنواع الهيكل
// شغل هذا الكود في صفحة موديل محدد مثل: https://www.netcarshow.com/bmw/i8/

function extractModelDetails() {
  console.log('🚗 استخراج تفاصيل الموديل الحالي...');

  const modelData = {
    make: { id: '', name: '' },
    model: { id: '', name: '' },
    generations: [],
    extractedAt: new Date().toISOString(),
    source: window.location.href
  };

  // استخراج اسم الشركة والموديل من العنوان
  const titleElement = document.querySelector('h1') || document.querySelector('.model-title');
  if (titleElement) {
    const titleText = titleElement.textContent.trim();
    // محاولة فصل اسم الشركة عن اسم الموديل
    const parts = titleText.split(' ');
    if (parts.length >= 2) {
      modelData.make.name = parts[0];
      modelData.model.name = parts.slice(1).join(' ');
    }
  }

  // استخراج IDs من URL
  const urlMatch = window.location.href.match(/netcarshow\.com\/([^\/]+)\/([^\/]+)/);
  if (urlMatch) {
    modelData.make.id = urlMatch[1].toLowerCase();
    modelData.model.id = urlMatch[2].toLowerCase();
  }

  console.log(`📋 استخراج بيانات: ${modelData.make.name} ${modelData.model.name}`);

  // استخراج الأجيال من الروابط أو القوائم
  const generationLinks = document.querySelectorAll('a[href*="/generation/"], .generation-link');
  const uniqueGenerations = new Map();

  generationLinks.forEach(link => {
    const href = link.href || link.getAttribute('href');
    const genMatch = href.match(/\/generation\/([^\/]+)\/?$/);

    if (genMatch) {
      const genId = genMatch[1];
      const genName = link.textContent.trim();

      // استخراج السنوات من النص
      const yearMatch = genName.match(/(\d{4})/g);
      const years = yearMatch ? yearMatch.join('-') : '';

      if (!uniqueGenerations.has(genId)) {
        uniqueGenerations.set(genId, {
          id: genId,
          name: genName,
          years: years,
          bodyStyles: []
        });
      }
    }
  });

  // إذا لم نجد روابط أجيال، نبحث عن قوائم أخرى
  if (uniqueGenerations.size === 0) {
    const generationElements = document.querySelectorAll('.generation, [data-generation]');
    generationElements.forEach((element, index) => {
      const genName = element.textContent.trim();
      const genId = `gen_${index + 1}`;

      const yearMatch = genName.match(/(\d{4})/g);
      const years = yearMatch ? yearMatch.join('-') : '';

      uniqueGenerations.set(genId, {
        id: genId,
        name: genName,
        years: years,
        bodyStyles: []
      });
    });
  }

  modelData.generations = Array.from(uniqueGenerations.values());

  // استخراج أنواع الهيكل لكل جيل
  modelData.generations.forEach((generation, index) => {
    // البحث عن أنواع الهيكل المرتبطة بهذا الجيل
    const bodyStyleElements = document.querySelectorAll(`[data-generation="${generation.id}"] .body-style, .body-style-${index + 1}`);

    if (bodyStyleElements.length === 0) {
      // البحث العام عن أنواع الهيكل
      const allBodyStyles = document.querySelectorAll('.body-style, [data-body]');
      allBodyStyles.forEach(bodyElement => {
        const bodyName = bodyElement.textContent.trim();
        const bodyId = bodyName.toLowerCase().replace(/\s+/g, '_');

        if (!generation.bodyStyles.find(bs => bs.id === bodyId)) {
          generation.bodyStyles.push({
            id: bodyId,
            name: bodyName
          });
        }
      });
    } else {
      bodyStyleElements.forEach(bodyElement => {
        const bodyName = bodyElement.textContent.trim();
        const bodyId = bodyName.toLowerCase().replace(/\s+/g, '_');

        generation.bodyStyles.push({
          id: bodyId,
          name: bodyName
        });
      });
    }
  });

  console.log(`✅ تم استخراج ${modelData.generations.length} جيل`);

  // حفظ البيانات
  const dataStr = JSON.stringify(modelData, null, 2);
  console.log('📋 البيانات المستخرجة:', dataStr);

  // نسخ البيانات إلى الحافظة
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('✅ تم نسخ البيانات إلى الحافظة!');
    });
  }

  return modelData;
}

// تشغيل الاستخراج
extractModelDetails();