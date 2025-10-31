# ⚠️ BigQuery Extension - القيم الصحيحة

## المشكلة
لقد أدخلت `europe-west3` في حقلين يجب أن يكونا مختلفين:
- BigQuery Dataset location ← يجب أن تكون `eu` (منطقة متعددة)
- Firestore Instance Location ← يجب أن تكون `eur3` (موقع قاعدة البيانات الفعلي)

---

## ✅ القيم الصحيحة (انسخ بالضبط)

### Cloud Functions location
```
europe-west3
```
✅ هذه صحيحة - فرانكفورت للـ Cloud Functions

---

### BigQuery Dataset location
```
eu
```
⚠️ **صغيرة!** `eu` وليس `EU` أو `europe-west3`

---

### BigQuery Project ID
```
fire-new-globul
```
✅ صحيح

---

### Firestore Instance ID
```
(default)
```
✅ صحيح

---

### Firestore Instance Location
```
eur3
```
⚠️ **مهم جداً!** `eur3` وليس `europe-west3`

---

### Collection path
```
cars
```
✅ صحيح

---

### Enable Wildcard Column field with Parent Firestore Document IDs
```
No
```
✅ صحيح (أو false)

---

### Dataset ID
```
globul_analytics
```
✅ صحيح

---

### Table ID
```
cars
```
✅ صحيح

---

### BigQuery SQL table Time Partitioning option type
```
none
```
✅ صحيح (أو NONE)

---

### BigQuery SQL table clustering
```
data,document_id,timestamp
```
✅ صحيح

---

### Maximum number of synced documents per second
```
100
```
✅ صحيح

---

### View Type
```
view
```
✅ صحيح

---

### Use new query syntax for snapshots
```
no
```
✅ صحيح

---

### Exclude old data payloads
```
no
```
✅ صحيح

---

### Maximum number of enqueue attempts
```
3
```
✅ صحيح

---

### Log level
```
info
```
✅ صحيح

---

## 🎯 الخطوات:

1. **احذف الإضافة المعطلة الآن**:
   - في صفحة الإضافة، انقر **Manage** → **Uninstall extension**
   
2. **ثبت من جديد**:
   - Extensions → Install extension
   - Stream Collections to BigQuery
   
3. **انتبه للحقلين المهمين**:
   - BigQuery Dataset location: **eu** (صغيرة!)
   - Firestore Instance Location: **eur3** (ليس europe-west3!)

---

## 📝 ملخص الفرق:

| الحقل | ما أدخلته ❌ | الصحيح ✅ |
|-------|--------------|----------|
| Cloud Functions location | europe-west3 | europe-west3 ✅ |
| **BigQuery Dataset location** | **europe-west3** | **eu** |
| Firestore Instance Location | **europe-west3** | **eur3** |

---

**احذف الإضافة وأعد تثبيتها بالقيم الصحيحة أعلاه!** 🚀
