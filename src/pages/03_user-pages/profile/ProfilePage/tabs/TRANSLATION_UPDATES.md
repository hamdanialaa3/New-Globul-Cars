# 📝 Translation Updates - Data Settings Page

## ✅ تم إضافة ترجمات جديدة

### 1️⃣ Google Analytics Section
- **English**: `googleAnalytics: "Google Analytics"`
- **Help**: "View and manage your website visit and behavior tracking data"
- **Buttons**: 
  - `configure`: "Configure"
  - `disconnect`: "Disconnect"

- **Bulgarian**: `googleAnalytics: "Google Analytics"`
- **Help**: "Преглед и управление на данните за проследяване на посещенията и поведението на вашия уебсайт"
- **Buttons**:
  - `configure`: "Конфигуриране"
  - `disconnect`: "Разединяване"

### 2️⃣ BigQuery Export Section
- **English**: `bigQueryExport: "BigQuery Export"`
- **Help**: "Export advanced analytics data to Google BigQuery for deeper analysis"
- **Buttons**:
  - `connect`: "Connect"
  - `export`: "Export"

- **Bulgarian**: `bigQueryExport: "Експорт в BigQuery"`
- **Help**: "Експортирайте разширени данни за анализ в Google BigQuery за по-дълбок анализ"
- **Buttons**:
  - `connect`: "Свързване"
  - `export`: "Експортиране"

## 📁 Updated Files

### 1. DataSettingsEnhanced.tsx
- ✅ Added Google Analytics section with blue color (#4285f4)
- ✅ Added BigQuery Export section with red color (#ea4335)
- ✅ Added all translations (English & Bulgarian)
- ✅ Added button handlers with proper styling

### 2. web/src/locales/en/settings.ts
- ✅ Added 8 new translation keys
- ✅ Complete English translations for all new features

### 3. web/src/locales/bg/settings.ts
- ✅ Added 8 new translation keys
- ✅ Complete Bulgarian translations for all new features

## 🎨 Design Details

### Google Analytics Section
```
Color: Blue (#4285f4)
Icon: Download
Buttons:
  - Configure (Primary Blue)
  - Disconnect (Secondary)
```

### BigQuery Export Section
```
Color: Red (#ea4335)
Icon: Download
Buttons:
  - Connect (Primary Red)
  - Export (Secondary)
```

## 🔄 Language Support

- ✅ English (en)
- ✅ Bulgarian (bg)
- ℹ️ Arabic translations embedded in component (for consistency with existing pattern)

## 📍 Page Location

`http://localhost:3000/profile/90/settings?section=data`

## ✨ Features

1. **Google Analytics**
   - View and manage tracking data
   - Configure analytics settings
   - Disconnect from analytics

2. **BigQuery Export**
   - Connect to BigQuery
   - Export advanced analytics
   - Deep data analysis capabilities

## 🧪 Testing Checklist

- [ ] English translations display correctly
- [ ] Bulgarian translations display correctly
- [ ] Buttons have correct styling
- [ ] Colors match design system
- [ ] Hover effects work properly
- [ ] Icons display correctly
- [ ] Responsive design on mobile
- [ ] Dark/Light theme support
- [ ] RTL support for Arabic text

## 📊 New Translation Keys (Total: 8)

| Key | Type | Purpose |
|-----|------|---------|
| `googleAnalytics` | Title | Google Analytics section title |
| `googleAnalyticsHelp` | Description | Helper text for Google Analytics |
| `bigQueryExport` | Title | BigQuery Export section title |
| `bigQueryExportHelp` | Description | Helper text for BigQuery Export |
| `connect` | Button | Connect to service button |
| `configure` | Button | Configure settings button |
| `disconnect` | Button | Disconnect from service button |
| `export` | Button | Export data button |

---

**Updated**: February 4, 2026
**Status**: ✅ Complete and Ready for Testing
