# 🔗 دليل الربط مع منصات التواصل الاجتماعي (Integration Guide)

مرحباً! لكي يعمل النظام الآلي وينشر الإعلانات على فيسبوك وإنستغرام، نحتاج إلى إعداد "تطبيق" على منصة المطورين (Meta Developers) والحصول على مفاتيح الربط.

يرجى اتباع الخطوات التالية بدقة وتزويدي بالقيم النهائية (أو وضعها بنفسك في ملف `.env`).

---

## 🟢 الخطوة 1: إنشاء تطبيق على Meta Developers
1.  اذهب إلى: [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
2.  اضغط **Create App**.
3.  اختر النوع: **Business** (أعمال).
4.  املأ البيانات (اسم التطبيق: `Koli One Auto Publisher`).
5.  بعد الإنشاء، ستجد في الصفحة الرئيسية:
    *   **App ID**: (انسخه)
    *   **App Secret**: (اضغط Show وانسخه)

## 🔵 الخطوة 2: ربط صفحة فيسبوك وإنستغرام
1.  تأكد أن لديك "صفحة فيسبوك" للمشروع.
2.  تأكد أن حساب "إنستغرام" محول إلى **Business Account** ومربوط بنفس صفحة الفيسبوك.
    *   [شرح رابط إنستغرام بصفحة فيسبوك](https://www.facebook.com/help/instagram/399237934150902)

## 🟠 الخطوة 3: استخراج معرفات الصفحات (Page IDs)
استخدم أداة **Graph API Explorer**:
[https://developers.facebook.com/tools/explorer/](https://developers.facebook.com/tools/explorer/)

1.  في خانة "User or Page"، اختر **User Token**.
2.  في خانة "Add Permissions"، أضف صلاحيات النشر التالية (مهم جداً):
    *   `pages_manage_posts`
    *   `pages_read_engagement`
    *   `instagram_basic`
    *   `instagram_content_publish`
3.  اضغط **Generate Access Token** ووافق على الصلاحيات.
4.  الآن في خانة البحث (Query) اكتب:
    `me/accounts?fields=name,access_token,instagram_business_account`
5.  اضغط **Submit**.
6.  ستظهر لك نتيجة JSON. انسخ منها:
    *   `id` (هذا هو **FB_PAGE_ID**)
    *   `instagram_business_account.id` (هذا هو **IG_USER_ID**)
    *   `access_token` (هذا هو التوكن المؤقت، سنحوله لدائم لاحقاً).

## 🔴 المطلوب الآن
من فضلك قم بتعبئة هذه البيانات في ملف `dev_s_media/03_env.example` (بعد إعادة تسميته إلى `.env`) أو أرسلها لي لضبطها:

| المتغير | القيمة المطلوبة |
| :--- | :--- |
| `META_APP_ID` | معرف التطبيق من الخطوة 1 |
| `META_APP_SECRET` | سر التطبيق من الخطوة 1 |
| `FB_PAGE_ID` | معرف صفحة الفيسبوك من الخطوة 3 |
| `IG_USER_ID` | معرف حساب الإنستغرام من الخطوة 3 |

---

### ملاحظة عن التوكن (Token)
التوكن الذي نحصل عليه من Explorer مدته ساعة واحدة فقط.
للحصول على **Long-Lived Token** (مدته 60 يوماً)، سأقوم بإعداد سكربت آلي لك، لكن أحتاج `APP_ID` و `APP_SECRET` أولاً.
