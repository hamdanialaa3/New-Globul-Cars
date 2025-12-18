# إعداد Google Images API

## الخطوات:

### 1. إنشاء Google Cloud Project
1. اذهب إلى: https://console.cloud.google.com/
2. سجل دخول بحساب Google
3. اضغط "Create Project" أو اختر مشروع موجود
4. أعط المشروع اسم (مثل "Car Images Downloader")

### 2. تفعيل Custom Search API
1. في Google Cloud Console، اذهب إلى "APIs & Services" > "Library"
2. ابحث عن "Custom Search API"
3. اضغط "Enable"

### 3. إنشاء API Key
1. اذهب إلى "APIs & Services" > "Credentials"
2. اضغط "Create Credentials" > "API Key"
3. انسخ الـ API Key (سيظهر مثل: `AIzaSy...`)

### 4. إنشاء Custom Search Engine
1. اذهب إلى: https://programmablesearchengine.google.com/
2. اضغط "Add" لإنشاء محرك بحث جديد
3. املأ:
   - **Sites to search**: اتركه فارغ أو ضع `*` (للبحث في كل الإنترنت)
   - **Name**: أي اسم (مثل "Car Images Search")
4. اضغط "Create"
5. بعد الإنشاء، اضغط "Control Panel"
6. في "Setup" > "Basics"، انسخ **Search engine ID** (سيظهر مثل: `017576662512468239146:omuauf_lfve`)

### 5. استخدام الـ Keys
```powershell
py .\download_car_images_multi_source.py --provider google --google-api-key "YOUR_API_KEY" --google-cx "YOUR_SEARCH_ENGINE_ID" --brand "Mercedes-Benz" --strict-existing-models --require-year-folder
```

## ملاحظات:
- Google يعطي **100 طلب مجاني يوميًا** للـ API
- بعد 100 طلب، ستحتاج دفع (لكن السعر منخفض جدًا)
- API Key مجاني لكن احتفظ به سري (لا تشاركه)

