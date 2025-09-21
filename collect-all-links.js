// سكريبت لجمع جميع روابط الشركات والموديلات من netcarshow.com
// شغل هذا الكود في الصفحة الرئيسية https://www.netcarshow.com/

function collectAllLinks() {
  console.log('🔗 جمع جميع الروابط من netcarshow.com...');

  const links = {
    makes: [],
    models: [],
    collectedAt: new Date().toISOString(),
    source: window.location.href
  };

  // جمع روابط الشركات
  const makeLinks = document.querySelectorAll('a[href*="/"], .make-link');
  const uniqueMakes = new Map();

  makeLinks.forEach(link => {
    const href = link.href;
    if (href.includes('netcarshow.com/') && !href.includes('/model/') && !href.includes('/generation/')) {
      const makeMatch = href.match(/netcarshow\.com\/([^\/]+)\/?$/);
      if (makeMatch && makeMatch[1] !== '' && makeMatch[1] !== 'www') {
        const makeId = makeMatch[1].toLowerCase();
        const makeName = link.textContent.trim() || makeId.toUpperCase();

        if (!uniqueMakes.has(makeId)) {
          uniqueMakes.set(makeId, {
            id: makeId,
            name: makeName,
            url: href
          });
        }
      }
    }
  });

  links.makes = Array.from(uniqueMakes.values());

  // جمع روابط الموديلات
  const modelLinks = document.querySelectorAll('a[href*="/model/"]');
  const uniqueModels = new Map();

  modelLinks.forEach(link => {
    const href = link.href;
    const modelMatch = href.match(/netcarshow\.com\/([^\/]+)\/model\/([^\/]+)/);

    if (modelMatch) {
      const makeId = modelMatch[1].toLowerCase();
      const modelId = modelMatch[2].toLowerCase();
      const modelName = link.textContent.trim();

      const key = `${makeId}_${modelId}`;
      if (!uniqueModels.has(key)) {
        uniqueModels.set(key, {
          makeId: makeId,
          modelId: modelId,
          name: modelName,
          url: href
        });
      }
    }
  });

  links.models = Array.from(uniqueModels.values());

  console.log(`✅ تم جمع ${links.makes.length} شركة و ${links.models.length} موديل`);

  // حفظ البيانات
  const dataStr = JSON.stringify(links, null, 2);
  console.log('📋 الروابط المجموعة:', dataStr);

  // نسخ البيانات إلى الحافظة
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('✅ تم نسخ الروابط إلى الحافظة!');
    });
  }

  // عرض ملخص
  console.log('📊 ملخص الروابط:');
  console.log('🏭 الشركات:', links.makes.map(m => `${m.name} (${m.url})`));
  console.log('🚗 الموديلات:', links.models.slice(0, 10).map(m => `${m.name} (${m.url})`));
  if (links.models.length > 10) {
    console.log(`... و ${links.models.length - 10} موديل أخرى`);
  }

  return links;
}

// تشغيل جمع الروابط
collectAllLinks();