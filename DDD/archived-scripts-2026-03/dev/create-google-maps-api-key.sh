#!/bin/bash
# Script to create Google Maps API Key via Cloud Shell
# نسخ هذه الأوامر إلى Google Cloud Shell

echo "=========================================="
echo "إنشاء Google Maps API Key جديد"
echo "=========================================="
echo ""

# 1. التأكد من المشروع الصحيح
echo "1. التحقق من المشروع الحالي..."
gcloud config get-value project

echo ""
echo "2. تفعيل APIs المطلوبة..."
echo "   - Maps JavaScript API"
gcloud services enable maps-backend.googleapis.com --project=fire-new-globul

echo "   - Maps Embed API"
gcloud services enable maps-embed-backend.googleapis.com --project=fire-new-globul

echo "   - Geocoding API"
gcloud services enable geocoding-backend.googleapis.com --project=fire-new-globul

echo "   - Places API"
gcloud services enable places-backend.googleapis.com --project=fire-new-globul

echo ""
echo "3. إنشاء API Key جديد..."
API_KEY=$(gcloud alpha services api-keys create \
  --display-name="Maps API Key - $(date +%Y%m%d)" \
  --api-target=service=maps-backend.googleapis.com \
  --api-target=service=maps-embed-backend.googleapis.com \
  --api-target=service=geocoding-backend.googleapis.com \
  --api-target=service=places-backend.googleapis.com \
  --project=fire-new-globul \
  --format="value(name)" 2>/dev/null)

if [ -z "$API_KEY" ]; then
  echo "⚠️  محاولة طريقة بديلة..."
  # طريقة بديلة
  API_KEY=$(gcloud services api-keys create \
    --display-name="Maps API Key - $(date +%Y%m%d)" \
    --project=fire-new-globul \
    --format="value(name)" 2>/dev/null)
fi

if [ ! -z "$API_KEY" ]; then
  echo ""
  echo "✅ تم إنشاء API Key!"
  echo ""
  echo "4. الحصول على قيمة المفتاح..."
  KEY_VALUE=$(gcloud alpha services api-keys get-key-string "$API_KEY" \
    --project=fire-new-globul \
    --format="value(keyString)" 2>/dev/null)
  
  if [ -z "$KEY_VALUE" ]; then
    KEY_VALUE=$(gcloud services api-keys get-key-string "$API_KEY" \
      --project=fire-new-globul \
      --format="value(keyString)" 2>/dev/null)
  fi
  
  if [ ! -z "$KEY_VALUE" ]; then
    echo ""
    echo "=========================================="
    echo "✅ المفتاح الجديد:"
    echo "=========================================="
    echo "$KEY_VALUE"
    echo ""
    echo "=========================================="
    echo "📋 الخطوات التالية:"
    echo "=========================================="
    echo "1. انسخ المفتاح أعلاه"
    echo "2. افتح ملف .env في المشروع"
    echo "3. أضف السطر:"
    echo "   REACT_APP_GOOGLE_MAPS_API_KEY=$KEY_VALUE"
    echo "4. احفظ الملف وأعد تشغيل التطبيق"
    echo ""
    echo "🔒 لتقييد المفتاح (مهم للأمان):"
    echo "   - اذهب إلى: https://console.cloud.google.com/apis/credentials"
    echo "   - اضغط على المفتاح الذي أنشأته"
    echo "   - في 'Application restrictions': اختر 'HTTP referrers'"
    echo "   - أضف: localhost:*"
    echo "   - أضف: *.web.app"
    echo "   - أضف: *.firebaseapp.com"
    echo "   - أضف: mobilebg.eu"
    echo "   - أضف: *.mobilebg.eu"
    echo ""
  else
    echo "❌ فشل الحصول على قيمة المفتاح"
    echo "   اذهب إلى: https://console.cloud.google.com/apis/credentials"
    echo "   وانسخ المفتاح يدوياً"
  fi
else
  echo "❌ فشل إنشاء API Key"
  echo ""
  echo "📋 الطريقة اليدوية:"
  echo "1. اذهب إلى: https://console.cloud.google.com/apis/credentials?project=fire-new-globul"
  echo "2. اضغط 'Create Credentials' → 'API Key'"
  echo "3. انسخ المفتاح وأضفه إلى ملف .env"
fi

echo ""
echo "=========================================="
