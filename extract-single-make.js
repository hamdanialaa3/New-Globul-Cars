// سكريبت سريع لاستخراج بيانات شركة واحدة من netcarshow.com
// شغل هذا الكود في صفحة شركة محددة مثل: https://www.netcarshow.com/bmw/

function extractSingleMakeData() {
  console.log('🚗 استخراج بيانات الشركة الحالية...');

  const currentMake = {
    id: '',
    name: '',
    models: []
  };

  // استخراج اسم الشركة من العنوان أو URL
  const titleElement = document.querySelector('h1') || document.querySelector('.make-title');
  if (titleElement) {
    currentMake.name = titleElement.textContent.trim();
  }

  // استخراج ID الشركة من URL
  const urlMatch = window.location.href.match(/netcarshow\.com\/([^\/]+)/);
  if (urlMatch) {
    currentMake.id = urlMatch[1].toLowerCase();
  }

  console.log(`📋 استخراج بيانات شركة: ${currentMake.name} (${currentMake.id})`);

  // استخراج الموديلات من الصفحة
  const modelLinks = document.querySelectorAll('a[href*="/model/"]');
  const uniqueModels = new Map();

  modelLinks.forEach(link => {
    const href = link.href;
    const modelMatch = href.match(/\/model\/([^\/]+)\/?$/);

    if (modelMatch) {
      const modelId = modelMatch[1];
      const modelName = link.textContent.trim();

      if (!uniqueModels.has(modelId)) {
        uniqueModels.set(modelId, {
          id: modelId,
          name: modelName,
          url: href
        });
      }
    }
  });

  currentMake.models = Array.from(uniqueModels.values());

  console.log(`✅ تم استخراج ${currentMake.models.length} موديل`);

  // حفظ البيانات
  const data = {
    make: currentMake,
    extractedAt: new Date().toISOString(),
    source: window.location.href
  };

  const dataStr = JSON.stringify(data, null, 2);
  console.log('📋 البيانات المستخرجة:', dataStr);

  // نسخ البيانات إلى الحافظة
  if (navigator.clipboard) {
    navigator.clipboard.writeText(dataStr).then(() => {
      console.log('✅ تم نسخ البيانات إلى الحافظة!');
    });
  }

  return data;
}

// تشغيل الاستخراج
extractSingleMakeData();