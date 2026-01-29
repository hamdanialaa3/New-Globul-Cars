// Error Messages - Localized error messages for better UX
// رسائل الخطأ - رسائل خطأ محلية لتحسين تجربة المستخدم

export const ErrorMessages = {
  bg: {
    // Required fields
    MAKE_REQUIRED: '⚠️ Моля, изберете марка на автомобила',
    MODEL_REQUIRED: '⚠️ Моля, въведете модел',
    YEAR_REQUIRED: '⚠️ Моля, въведете година на производство',
    PRICE_REQUIRED: '⚠️ Моля, въведете цена',
    
    // Validation errors
    YEAR_INVALID: '❌ Годината трябва да е между 1900 и {currentYear}',
    YEAR_TOO_OLD: '❌ Годината не може да е преди 1900',
    YEAR_FUTURE: '❌ Годината не може да е в бъдещето',
    PRICE_TOO_LOW: '❌ Минималната цена е 100 EUR',
    PRICE_TOO_HIGH: '❌ Максималната цена е 1,000,000 EUR',
    MILEAGE_NEGATIVE: '❌ Пробегът не може да е отрицателен',
    MILEAGE_TOO_HIGH: '❌ Пробегът изглежда нереалистичен (>1,000,000 км)',
    
    // Contact information
    NAME_REQUIRED: '⚠️ Моля, въведете вашето име',
    EMAIL_REQUIRED: '⚠️ Моля, въведете имейл адрес',
    EMAIL_INVALID: '❌ Моля, въведете валиден имейл адрес',
    PHONE_REQUIRED: '⚠️ Моля, въведете телефонен номер',
    PHONE_INVALID: '❌ Моля, въведете валиден български телефонен номер (+359...)',
    
    // Location
    REGION_REQUIRED: '⚠️ Моля, изберете област',
    CITY_REQUIRED: '⚠️ Моля, изберете град',
    
    // Images
    NO_IMAGES: '⚠️ Моля, качете поне 1 снимка',
    IMAGE_TOO_LARGE: '❌ Снимката е твърде голяма (макс. 10 MB)',
    IMAGE_INVALID_TYPE: '❌ Невалиден формат на снимката. Използвайте JPG, PNG или WebP',
    TOO_MANY_IMAGES: '❌ Максимум 20 снимки са разрешени',
    UPLOAD_FAILED: '❌ Грешка при качване на снимка. Моля, опитайте отново.',
    
    // Network errors
    NO_INTERNET: '📡 Няма интернет връзка. Проверете и опитайте отново.',
    SERVER_ERROR: '🔧 Сървърна грешка. Моля, опитайте отново след малко.',
    TIMEOUT: '⏱️ Заявката отне твърде много време. Проверете връзката си.',
    
    // Auth errors
    NOT_AUTHENTICATED: '🔒 Моля, влезте в акаунта си, за да продължите',
    SESSION_EXPIRED: '⏰ Сесията ви е изтекла. Моля, влезте отново.',
    
    // Publishing errors
    PUBLISH_FAILED: '❌ Неуспешно публикуване. Моля, опитайте отново.',
    MISSING_DATA: '⚠️ Липсват задължителни данни. Моля, попълнете всички полета.',
    
    // Success messages
    DRAFT_SAVED: '💾 Черновата е запазена!',
    AUTO_SAVED: '✓ Автоматично запазено',
    PUBLISHED_SUCCESS: '🎉 Обявата е публикувана успешно!',
    
    // Tips
    TIP_YEAR: '💡 Съвет: Проверете годината в техническия паспорт',
    TIP_MILEAGE: '💡 Съвет: Въведете точния пробег от километража',
    TIP_PRICE: '💡 Съвет: Проверете средната цена за подобни автомобили',
    TIP_IMAGES: '💡 Съвет: Качете снимки от различни ъгли за по-добра видимост',
  },
  
  en: {
    // Required fields
    MAKE_REQUIRED: '⚠️ Please select car make',
    MODEL_REQUIRED: '⚠️ Please enter model',
    YEAR_REQUIRED: '⚠️ Please enter production year',
    PRICE_REQUIRED: '⚠️ Please enter price',
    
    // Validation errors
    YEAR_INVALID: '❌ Year must be between 1900 and {currentYear}',
    YEAR_TOO_OLD: '❌ Year cannot be before 1900',
    YEAR_FUTURE: '❌ Year cannot be in the future',
    PRICE_TOO_LOW: '❌ Minimum price is 100 EUR',
    PRICE_TOO_HIGH: '❌ Maximum price is 1,000,000 EUR',
    MILEAGE_NEGATIVE: '❌ Mileage cannot be negative',
    MILEAGE_TOO_HIGH: '❌ Mileage seems unrealistic (>1,000,000 km)',
    
    // Contact information
    NAME_REQUIRED: '⚠️ Please enter your name',
    EMAIL_REQUIRED: '⚠️ Please enter email address',
    EMAIL_INVALID: '❌ Please enter a valid email address',
    PHONE_REQUIRED: '⚠️ Please enter phone number',
    PHONE_INVALID: '❌ Please enter a valid Bulgarian phone number (+359...)',
    
    // Location
    REGION_REQUIRED: '⚠️ Please select region',
    CITY_REQUIRED: '⚠️ Please select city',
    
    // Images
    NO_IMAGES: '⚠️ Please upload at least 1 image',
    IMAGE_TOO_LARGE: '❌ Image is too large (max. 10 MB)',
    IMAGE_INVALID_TYPE: '❌ Invalid image format. Use JPG, PNG or WebP',
    TOO_MANY_IMAGES: '❌ Maximum 20 images allowed',
    UPLOAD_FAILED: '❌ Failed to upload image. Please try again.',
    
    // Network errors
    NO_INTERNET: '📡 No internet connection. Please check and try again.',
    SERVER_ERROR: '🔧 Server error. Please try again later.',
    TIMEOUT: '⏱️ Request took too long. Check your connection.',
    
    // Auth errors
    NOT_AUTHENTICATED: '🔒 Please log in to continue',
    SESSION_EXPIRED: '⏰ Your session has expired. Please log in again.',
    
    // Publishing errors
    PUBLISH_FAILED: '❌ Failed to publish. Please try again.',
    MISSING_DATA: '⚠️ Missing required data. Please fill all fields.',
    
    // Success messages
    DRAFT_SAVED: '💾 Draft saved!',
    AUTO_SAVED: '✓ Auto-saved',
    PUBLISHED_SUCCESS: '🎉 Listing published successfully!',
    
    // Tips
    TIP_YEAR: '💡 Tip: Check the year in the vehicle registration',
    TIP_MILEAGE: '💡 Tip: Enter the exact mileage from the odometer',
    TIP_PRICE: '💡 Tip: Check average prices for similar cars',
    TIP_IMAGES: '💡 Tip: Upload photos from different angles for better visibility',
  }
};

export type LanguageCode = 'bg' | 'en';

export const getErrorMessage = (
  key: keyof typeof ErrorMessages.en,
  language: LanguageCode = 'bg',
  replacements?: Record<string, string>
): string => {
  let message = ErrorMessages[language][key] || ErrorMessages.en[key] || key;
  
  // Replace placeholders
  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
  }
  
  return message;
};

export default ErrorMessages;

