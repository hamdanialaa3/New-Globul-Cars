# ☁️ Azure Documentation - توثيق Azure

**دليل كامل لإعداد واستخدام Azure في المشروع**

---

## 📚 الملفات المتاحة

### 🚀 **[AZURE_QUICK_START_AR.md](AZURE_QUICK_START_AR.md)** ⭐
**دليل البداية السريعة بالعربية**

- خطوات الإعداد الأولية
- الأوامر الأساسية
- نصائح سريعة

**وقت القراءة:** 10 دقائق  
**الأولوية:** ⭐⭐⭐ ابدأ من هنا

---

### 📖 **[AZURE_README.md](AZURE_README.md)**
**نظرة عامة على Azure في المشروع**

- ما هي خدمات Azure المستخدمة؟
- لماذا نستخدم Azure؟
- الهيكل العام

**متى تستخدمه:** للفهم العام

---

### 🔧 **[AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md)**
**دليل الإعداد الكامل والمفصل**

- خطوات التثبيت التفصيلية
- التكوين المتقدم
- استكشاف الأخطاء وإصلاحها
- أمثلة عملية

**وقت القراءة:** 30-45 دقيقة  
**الأولوية:** ⭐⭐ للإعداد الكامل

---

## 🎯 خدمات Azure المستخدمة

### في المشروع:
- **Azure Functions** - Cloud Functions (Node.js 20)
- **Azure Storage** - تخزين الملفات والصور
- **Azure App Service** - استضافة التطبيق
- **Azure Cosmos DB** - قاعدة بيانات (مخطط)

---

## 🚀 البدء السريع

### للمطورين الجدد:
```bash
# 1. اقرأ دليل البداية السريعة
# AZURE_QUICK_START_AR.md

# 2. ثبّت Azure CLI
# راجع AZURE_SETUP_GUIDE.md

# 3. سجّل دخول
az login

# 4. اختبر الاتصال
az account show
```

### للنشر:
```bash
# راجع AZURE_SETUP_GUIDE.md للتفاصيل
npm run deploy:azure
```

---

## 📋 الترتيب الموصى به

### 1️⃣ للمبتدئين:
1. [AZURE_QUICK_START_AR.md](AZURE_QUICK_START_AR.md) - 10 دقائق
2. [AZURE_README.md](AZURE_README.md) - 5 دقائق
3. [AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md) - حسب الحاجة

### 2️⃣ للمتقدمين:
1. [AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md) - كامل
2. راجع [docs/CLOUD_FUNCTIONS_COMPLETE_LIST.md](../CLOUD_FUNCTIONS_COMPLETE_LIST.md)
3. راجع التوثيق الرسمي لـ Azure

---

## 🔗 روابط مفيدة

### التوثيق الرسمي:
- **Azure Portal:** https://portal.azure.com
- **Azure Docs:** https://docs.microsoft.com/azure
- **Azure CLI:** https://docs.microsoft.com/cli/azure

### في المشروع:
- **Cloud Functions List:** [../CLOUD_FUNCTIONS_COMPLETE_LIST.md](../CLOUD_FUNCTIONS_COMPLETE_LIST.md)
- **Architecture Docs:** [../architecture/](../architecture/)

---

## ⚠️ ملاحظات مهمة

### 🔐 الأمان:
- ❌ **أبداً** لا تُشارك Azure credentials في Git
- ✅ استخدم Azure Key Vault للأسرار
- ✅ راجع [SECURITY.md](../../SECURITY.md) للمزيد

### 💰 التكاليف:
- راقب استخدامك في Azure Portal
- استخدم Free Tier للتطوير
- راجع التكاليف شهرياً

---

## 🆘 المساعدة

- **للمشاكل العامة:** راجع [AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md)
- **للمشاكل التقنية:** راجع [docs/troubleshooting/](../troubleshooting/)
- **للتوثيق الكامل:** راجع [DOCUMENTATION_MAP.md](../../DOCUMENTATION_MAP.md)

---

**© 2026 Koli One - Cloud Native!** ☁️
