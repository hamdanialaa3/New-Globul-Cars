# 🚀 أدلة تشغيل الخادم

## الطريقة الأسهل (موصى بها)

### Windows - ملف BAT
```bash
# انقر نقراً مزدوجاً على الملف أو شغله من Terminal
START_SERVER.bat
```

### PowerShell
```powershell
.\START_SERVER_CLEAN.ps1
```

---

## الطرق البديلة

### 1. تنظيف المنافذ أولاً ثم التشغيل

#### تنظيف المنافذ فقط:
```powershell
.\CLEAN_PORTS.ps1
```

#### ثم تشغيل الخادم:
```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars"
$env:NODE_OPTIONS="--max_old_space_size=10096"
$env:BROWSER="none"
npm start
```

### 2. استخدام سكريبت npm الموجود
```bash
npm run start:dev
```

### 3. الطريقة اليدوية (الأصلية)
```powershell
cd "C:\Users\hamda\Desktop\New Globul Cars"
$env:NODE_OPTIONS="--max_old_space_size=10096"
$env:BROWSER="none"
npm start
```

---

## 🧹 تنظيف المنافذ يدوياً

إذا واجهت مشكلة في المنافذ المحجوزة:

### PowerShell:
```powershell
# تنظيف منفذ معين
$port = 3000
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    Stop-Process -Id $pid -Force
}

# تنظيف جميع عمليات Node.js
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### CMD:
```cmd
# تنظيف منفذ معين
netstat -ano | findstr :3000
taskkill /F /PID [PID_NUMBER]

# تنظيف جميع عمليات Node.js
taskkill /F /IM node.exe /T
```

---

## 📝 المتغيرات البيئية المستخدمة

- `NODE_OPTIONS`: `--max_old_space_size=10096` - زيادة ذاكرة Node.js
- `BROWSER`: `none` - عدم فتح المتصفح تلقائياً
- `PORT`: `3000` - المنفذ المستخدم
- `HOST`: `localhost` - العنوان

---

## ⚠️ حل المشاكل الشائعة

### المشكلة: "Port 3000 is already in use"
**الحل**: شغّل `CLEAN_PORTS.ps1` أو `START_SERVER.bat` الذي ينظف المنافذ تلقائياً

### المشكلة: "Error: spawn EACCES" أو مشاكل في الذاكرة
**الحل**: تأكد من أن `NODE_OPTIONS` مضبوطة بشكل صحيح:
```powershell
$env:NODE_OPTIONS="--max_old_space_size=10096"
```

### المشكلة: الخادم بطيء أو يتعطل
**الحل**: 
1. نظف الكاش: `npm cache clean --force`
2. احذف `node_modules/.cache`
3. أعد تثبيت المكتبات: `npm install`

---

## 💡 نصائح

1. **استخدم `START_SERVER.bat` دائماً** - ينظف وينظم كل شيء تلقائياً
2. **إذا فشل التشغيل** - شغّل `CLEAN_PORTS.ps1` أولاً ثم `START_SERVER.bat`
3. **للتشغيل السريع** - استخدم `npm run start:dev` من package.json

