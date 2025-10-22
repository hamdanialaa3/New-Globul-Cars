#!/bin/bash

# ============================================
# نقل سريع للبيانات من Firebase القديم للجديد
# Quick Migration from Old to New Firebase
# ============================================

echo "🚀 بدء عملية نقل البيانات..."
echo "🚀 Starting data migration..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

OLD_PROJECT="studio-448742006-a3493"
NEW_PROJECT="fire-new-globul"
BACKUP_BUCKET="gs://${OLD_PROJECT}.appspot.com"
NEW_BUCKET="gs://${NEW_PROJECT}.appspot.com"

# ============================================
# Step 1: Configure Old Project
# ============================================
echo -e "${BLUE}📂 الخطوة 1: الاتصال بالمشروع القديم${NC}"
gcloud config set project $OLD_PROJECT

# ============================================
# Step 2: Export Firestore Data
# ============================================
echo -e "${BLUE}📤 الخطوة 2: تصدير بيانات Firestore${NC}"
EXPORT_PATH="${BACKUP_BUCKET}/firestore-export-$(date +%Y%m%d-%H%M%S)"
echo "Exporting to: $EXPORT_PATH"

gcloud firestore export $EXPORT_PATH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم تصدير البيانات بنجاح${NC}"
else
    echo -e "${RED}❌ فشل تصدير البيانات${NC}"
    exit 1
fi

# ============================================
# Step 3: Copy Data to New Project Bucket
# ============================================
echo -e "${BLUE}📋 الخطوة 3: نسخ البيانات للمشروع الجديد${NC}"

# Create new bucket if not exists
gsutil ls $NEW_BUCKET 2>/dev/null || gsutil mb $NEW_BUCKET

# Copy data
gsutil -m cp -r $EXPORT_PATH $NEW_BUCKET/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم نسخ البيانات بنجاح${NC}"
else
    echo -e "${RED}❌ فشل نسخ البيانات${NC}"
    exit 1
fi

# ============================================
# Step 4: Configure New Project
# ============================================
echo -e "${BLUE}🔄 الخطوة 4: الاتصال بالمشروع الجديد${NC}"
gcloud config set project $NEW_PROJECT

# ============================================
# Step 5: Import to New Firestore
# ============================================
echo -e "${BLUE}📥 الخطوة 5: استيراد البيانات لـ Firestore الجديد${NC}"
IMPORT_PATH=$(echo $EXPORT_PATH | sed "s|$BACKUP_BUCKET|$NEW_BUCKET|")

gcloud firestore import $IMPORT_PATH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم استيراد البيانات بنجاح${NC}"
else
    echo -e "${RED}❌ فشل استيراد البيانات${NC}"
    exit 1
fi

# ============================================
# Step 6: Export/Import Authentication Users
# ============================================
echo -e "${BLUE}👥 الخطوة 6: نقل بيانات المستخدمين (Authentication)${NC}"

# Export users from old project
echo "Exporting users..."
gcloud config set project $OLD_PROJECT
gcloud firestore export-users users-backup.json

# Import users to new project
echo "Importing users..."
gcloud config set project $NEW_PROJECT
gcloud firestore import-users users-backup.json --hash-algorithm=SCRYPT

# ============================================
# Step 7: Verify Migration
# ============================================
echo -e "${BLUE}🔍 الخطوة 7: التحقق من النقل${NC}"

echo "Checking Firestore collections..."
gcloud firestore databases list

echo ""
echo -e "${GREEN}🎉 ===============================================${NC}"
echo -e "${GREEN}🎉 اكتملت عملية النقل بنجاح!${NC}"
echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
echo -e "${GREEN}🎉 ===============================================${NC}"
echo ""
echo -e "${YELLOW}📋 الخطوات التالية:${NC}"
echo "1. افتح Firebase Console وتحقق من البيانات"
echo "2. تحديث Firestore Rules إذا لزم الأمر"
echo "3. اختبار التطبيق"
echo "4. حذف النسخة الاحتياطية القديمة بعد التأكد"
echo ""
echo "Firebase Console: https://console.firebase.google.com/project/$NEW_PROJECT/firestore"

