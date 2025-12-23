# 🎓 نظام تدريب الذكاء الاصطناعي - Quick Start

## ⚡ التشغيل السريع (3 خطوات)

### 1️⃣ تدريب الـ AI على المشروع
```bash
npm run train-ai
```

### 2️⃣ انسخ قاعدة المعرفة لـ public
```bash
# Windows PowerShell
Copy-Item data\project-knowledge.json public\data\

# أو استخدم symlink
mklink /H public\data\project-knowledge.json data\project-knowledge.json
```

### 3️⃣ ابدأ المشروع واختبر
```bash
npm start
```

افتح الـ Chatbot واسأل:
- "أين موجود سيرفس السيارات؟"
- "كيف يعمل نظام الـ Authentication؟"
- "ما هي الدوال في firebase-config؟"

---

## 📊 ما الذي يحدث؟

```
المشروع (450+ ملف)
        ↓
  train-ai-on-project.js
        ↓
  يقرأ ويحلل جميع الملفات
        ↓
  project-knowledge.json (2-5 MB)
        ↓
  projectKnowledgeService
        ↓
  Gemini AI Chatbot 🤖
        ↓
  AI خبير بالمشروع! 🎓
```

---

## 🎯 الميزات

✅ **RAG System** - Retrieval-Augmented Generation  
✅ **Smart Search** - بحث ذكي في 3 أبعاد  
✅ **Auto Context** - سياق تلقائي للـ AI  
✅ **450+ Files** - تحليل كامل للمشروع  
✅ **1000+ Functions** - فهرسة جميع الدوال  
✅ **Instant Answers** - إجابات فورية ودقيقة  

---

## 📖 الدليل الكامل

راجع [AI_TRAINING_GUIDE.md](AI_TRAINING_GUIDE.md) للتفاصيل الكاملة.

---

**🚀 جاهز للاستخدام الآن!**
