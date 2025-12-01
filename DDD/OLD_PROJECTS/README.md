# Bulgarian Car Valuation AI Model

هذا المشروع يحتوي على نموذج الذكاء الاصطناعي لتقييم أسعار السيارات في السوق البلغاري.

## الميزات

- نموذج تقييم ذكي باستخدام XGBoost
- تدريب على بيانات BigQuery
- نشر كـ Vertex AI Endpoint
- دعم كامل للسوق البلغاري (يورو، بلغاريا)

## المتطلبات

- Python 3.8+
- Google Cloud SDK
- Vertex AI API مفعل

## التثبيت

```bash
pip install -r requirements.txt
```

## الاستخدام

### تدريب النموذج

```bash
python train_model.py
```

### نشر النموذج

```bash
python deploy_model.py
```

### اختبار النموذج

```bash
python test_model.py
```

## البيانات

يستخدم النموذج البيانات من BigQuery dataset `car_marketplace_analytics.cars` مع الميزات التالية:

- make: ماركة السيارة
- model: موديل السيارة
- year: سنة الصنع
- mileage: الكيلومترات المقطوعة
- fuel_type: نوع الوقود
- transmission: نوع النقل
- location: الموقع في بلغاريا
- condition: حالة السيارة

## الإخراج

يقوم النموذج بالتنبؤ بسعر السيارة باليورو مع درجة الثقة.

## الدقة

الهدف: تحقيق دقة 85%+ في التنبؤات مع بيانات السوق البلغاري.