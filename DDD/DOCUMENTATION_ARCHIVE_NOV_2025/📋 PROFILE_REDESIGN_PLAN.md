# 🎨 خطة إعادة تصميم صفحة البروفايل - مستوحاة من mobile.de
## Professional Profile Page Redesign Plan

---

## 🎯 الهدف
تحويل صفحة البروفايل إلى تجربة احترافية مشابهة لـ mobile.de مع التركيز على:
- **الوضوح:** معلومات واضحة ومنظمة
- **الثقة:** إظهار حالة التحقق والمصداقية
- **السهولة:** تنقل سهل وسريع
- **الاحترافية:** تصميم نظيف ومحترف

---

## 📊 تحليل mobile.de

### ✅ ما يميز mobile.de:

#### 1. **Navigation Sidebar** (القائمة الجانبية)
```
✅ My mobile.de (الرئيسية)
✅ Settings (الإعدادات)
✅ Edit Profile (تعديل البروفايل)

Sections:
├── Overview (نظرة عامة)
├── Messages (الرسائل)
├── Buy (الشراء)
│   ├── My Searches
│   ├── Car park
│   └── Orders
├── Sell (البيع)
│   ├── Ads
│   └── Direct Sale
└── My Profile
    ├── My vehicles
    └── Settings
```

#### 2. **Profile Settings Page** (صفحة الإعدادات)
```
Account Settings:
├── Customer Number (رقم العميل)
├── Profile (البروفايل)
│   └── Profile Picture (الصورة الشخصية)
├── Login Data (بيانات الدخول)
│   ├── Email (مع حالة التأكيد)
│   └── Password (مخفي)
├── Contact Data (بيانات الاتصال)
│   ├── Name
│   ├── Address (العنوان الكامل)
│   └── Phone (مع زر التأكيد)
├── Documents (المستندات)
│   └── My Invoices (الفواتير)
└── Delete Account (حذف الحساب)
```

#### 3. **Visual Elements** (العناصر البصرية)
```
✅ Customer Number Badge
✅ Verification Icons (✓)
✅ Action Buttons (Primary/Secondary)
✅ Status Indicators (Confirmed/Not confirmed)
✅ Section Cards (بطاقات منفصلة)
✅ Clean Typography (خطوط واضحة)
```

---

## 🎨 التصميم المقترح

### 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Cover Image + Profile Photo)                   │
├─────────────┬───────────────────────────────────────────┤
│             │  MAIN CONTENT AREA                         │
│  SIDEBAR    │  ┌──────────────────────────────────────┐ │
│             │  │  Customer Number Badge               │ │
│  - Overview │  └──────────────────────────────────────┘ │
│  - Messages │                                            │
│  - Buy      │  ┌──────────────────────────────────────┐ │
│  - Sell     │  │  PROFILE CARD                        │ │
│  - Settings │  │  - Profile Picture (editable)        │ │
│             │  │  - Verification Badge                │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │  ┌──────────────────────────────────────┐ │
│             │  │  LOGIN DATA CARD                     │ │
│             │  │  - Email (✓ Confirmed)              │ │
│             │  │  - Password (••••••)                │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │  ┌──────────────────────────────────────┐ │
│             │  │  CONTACT DATA CARD                   │ │
│             │  │  - Name                              │ │
│             │  │  - Address                           │ │
│             │  │  - Phone (⚠ Not confirmed)          │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │  ┌──────────────────────────────────────┐ │
│             │  │  DOCUMENTS CARD                      │ │
│             │  │  - My Invoices                       │ │
│             │  └──────────────────────────────────────┘ │
│             │                                            │
│             │  ┌──────────────────────────────────────┐ │
│             │  │  DANGER ZONE                         │ │
│             │  │  - Delete Account                    │ │
│             │  └──────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────┘
```

---

## 🎯 المكونات المطلوبة

### 1. **Customer Number Badge** (شارة رقم العميل)
```typescript
<CustomerNumberBadge>
  <Icon>👤</Icon>
  <Text>
    {language === 'bg' 
      ? 'Вашият клиентски номер е:' 
      : 'Your customer number is:'}
  </Text>
  <Number>27765111</Number>
</CustomerNumberBadge>
```

**Design:**
- Background: Light gradient (#f8f9fa → #e9ecef)
- Border: 1px solid #dee2e6
- Border-radius: 12px
- Padding: 16px 24px
- Font: Bold for number

---

### 2. **Profile Card** (بطاقة البروفايل)

```typescript
<ProfileCard>
  <SectionHeader>
    <Title>
      <UserIcon />
      {language === 'bg' ? 'Профил' : 'Profile'}
    </Title>
    <EditButton onClick={() => navigate('/profile/settings')}>
      <EditIcon />
      {language === 'bg' ? 'Редактирай' : 'Edit'}
    </EditButton>
  </SectionHeader>
  
  <ProfilePhotoSection>
    <ProfilePhoto src={user.profileImage} />
    <PrivacyNote>
      ({language === 'bg' ? 'Видимо само за вас' : 'Only visible for you'})
    </PrivacyNote>
  </ProfilePhotoSection>
</ProfileCard>
```

**Design:**
- White background
- Box-shadow: 0 2px 8px rgba(0,0,0,0.08)
- Border-radius: 12px
- Padding: 24px

---

### 3. **Login Data Card** (بطاقة بيانات الدخول)

```typescript
<LoginDataCard>
  <SectionHeader>
    <Title>
      <LockIcon />
      {language === 'bg' ? 'Данни за вход' : 'Login data'}
    </Title>
  </SectionHeader>
  
  <DataRow>
    <Label>
      {language === 'bg' ? 'Имейл адрес' : 'E-mail Address'}
    </Label>
    <Value>
      {user.email}
      <VerificationBadge verified={user.emailVerified}>
        {user.emailVerified ? (
          <>
            <CheckIcon />
            {language === 'bg' ? 'Потвърден' : 'Confirmed'}
          </>
        ) : (
          <>
            <AlertIcon />
            {language === 'bg' ? 'Непотвърден' : 'Not confirmed'}
          </>
        )}
      </VerificationBadge>
    </Value>
  </DataRow>
  
  <DataRow>
    <Label>
      {language === 'bg' ? 'Парола' : 'Password'}
    </Label>
    <Value>
      ••••••••••••
      <ChangeButton onClick={openPasswordModal}>
        {language === 'bg' ? 'Промяна' : 'Change'}
      </ChangeButton>
    </Value>
  </DataRow>
</LoginDataCard>
```

**Design:**
- VerificationBadge colors:
  - Confirmed: #28a745 (green)
  - Not confirmed: #ffc107 (yellow)
- Inline layout for value + badge
- Hover effect on buttons

---

### 4. **Contact Data Card** (بطاقة بيانات الاتصال)

```typescript
<ContactDataCard>
  <SectionHeader>
    <Title>
      <PhoneIcon />
      {language === 'bg' ? 'Данни за контакт' : 'Contact data'}
    </Title>
  </SectionHeader>
  
  <DataRow>
    <Label>{language === 'bg' ? 'Име' : 'Name'}</Label>
    <Value>{user.firstName} {user.lastName}</Value>
  </DataRow>
  
  <DataRow>
    <Label>{language === 'bg' ? 'Адрес' : 'Address'}</Label>
    <Value>
      {user.address?.street}<br/>
      {user.address?.postalCode} {user.address?.city}
    </Value>
  </DataRow>
  
  <DataRow>
    <Label>{language === 'bg' ? 'Телефонен номер' : 'Phone number'}</Label>
    <Value>
      {user.phoneNumber}
      <VerificationBadge verified={user.phoneVerified}>
        {user.phoneVerified ? (
          <>
            <CheckIcon />
            {language === 'bg' ? 'Потвърден' : 'Confirmed'}
          </>
        ) : (
          <>
            <AlertIcon />
            {language === 'bg' ? 'Непотвърден' : 'Not confirmed'}
            <ConfirmButton onClick={sendPhoneVerification}>
              {language === 'bg' 
                ? 'Потвърди телефонен номер сега' 
                : 'Confirm phone number now'}
            </ConfirmButton>
          </>
        )}
      </VerificationBadge>
    </Value>
  </DataRow>
  
  {!user.phoneVerified && (
    <InfoBox>
      <InfoIcon />
      <InfoText>
        {language === 'bg'
          ? 'Активирайте допълнителни функции: Потвърдете телефонния номер сега'
          : 'Activate additional functions: Confirm phone number now'}
      </InfoText>
    </InfoBox>
  )}
</ContactDataCard>
```

**Design:**
- InfoBox: Light blue background (#e7f3ff)
- Icon color: #0066cc
- Border: 1px solid #b3d9ff
- Border-radius: 8px

---

### 5. **Documents Card** (بطاقة المستندات)

```typescript
<DocumentsCard>
  <SectionHeader>
    <Title>
      <FileIcon />
      {language === 'bg' ? 'Документи' : 'Documents'}
    </Title>
  </SectionHeader>
  
  <SubSection>
    <SubTitle>
      {language === 'bg' ? 'Моите фактури' : 'My invoices'}
    </SubTitle>
    <Description>
      {language === 'bg'
        ? 'Тук ще намерите преглед на вашите резервирани пакети и опции'
        : 'Here you will find an overview of your booked packages and options'}
    </Description>
    
    {invoices.length > 0 ? (
      <InvoicesList>
        {invoices.map(invoice => (
          <InvoiceItem key={invoice.id}>
            <InvoiceIcon />
            <InvoiceInfo>
              <InvoiceTitle>{invoice.title}</InvoiceTitle>
              <InvoiceDate>{invoice.date}</InvoiceDate>
            </InvoiceInfo>
            <DownloadButton>
              <DownloadIcon />
            </DownloadButton>
          </InvoiceItem>
        ))}
      </InvoicesList>
    ) : (
      <EmptyState>
        {language === 'bg'
          ? 'Няма налични фактури'
          : 'No invoices available'}
      </EmptyState>
    )}
  </SubSection>
</DocumentsCard>
```

---

### 6. **Danger Zone Card** (منطقة الخطر)

```typescript
<DangerZoneCard>
  <SectionHeader>
    <Title>
      <TrashIcon />
      {language === 'bg' ? 'Изтриване на акаунт' : 'Delete account'}
    </Title>
  </SectionHeader>
  
  <AccountInfo>
    <AccountEmail>{user.email}</AccountEmail>
    <AccountType>
      {language === 'bg' 
        ? `Личен акаунт, регистриран от ${user.registeredYear}`
        : `Private account, registered since ${user.registeredYear}`}
    </AccountType>
  </AccountInfo>
  
  <DangerButton onClick={handleDeleteAccount}>
    <TrashIcon />
    {language === 'bg' ? 'Изтрий акаунта' : 'Delete account'}
  </DangerButton>
  
  <Warning>
    {language === 'bg'
      ? 'Внимание: Това действие е необратимо!'
      : 'Warning: This action is irreversible!'}
  </Warning>
</DangerZoneCard>
```

**Design:**
- Border: 2px solid #dc3545 (red)
- DangerButton background: #dc3545
- Warning text color: #721c24
- Background: #f8d7da (light red)

---

## 🎨 Design Tokens

### Colors
```scss
// Primary
$primary: #FF7900;
$primary-dark: #E66D00;
$primary-light: #FF8F10;

// Success (Verified)
$success: #28a745;
$success-light: #d4edda;
$success-border: #c3e6cb;

// Warning (Not Verified)
$warning: #ffc107;
$warning-light: #fff3cd;
$warning-border: #ffeeba;

// Danger
$danger: #dc3545;
$danger-light: #f8d7da;
$danger-border: #f5c6cb;

// Info
$info: #0066cc;
$info-light: #e7f3ff;
$info-border: #b3d9ff;

// Neutrals
$white: #ffffff;
$gray-50: #f8f9fa;
$gray-100: #e9ecef;
$gray-200: #dee2e6;
$gray-300: #ced4da;
$gray-600: #6c757d;
$gray-900: #212529;
```

### Typography
```scss
// Font Family
$font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

// Font Sizes
$font-xs: 0.75rem;   // 12px
$font-sm: 0.875rem;  // 14px
$font-base: 1rem;    // 16px
$font-lg: 1.125rem;  // 18px
$font-xl: 1.25rem;   // 20px
$font-2xl: 1.5rem;   // 24px

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### Spacing
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
```

### Border Radius
```scss
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-full: 9999px;
```

### Shadows
```scss
$shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
$shadow-md: 0 2px 8px rgba(0,0,0,0.08);
$shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
```

---

## 📱 Responsive Design

### Breakpoints
```scss
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;
$wide: 1280px;
```

### Mobile Layout
```
┌───────────────────────┐
│  HEADER               │
├───────────────────────┤
│  TABS (Horizontal)    │
├───────────────────────┤
│  MAIN CONTENT         │
│  (Stacked Cards)      │
│                       │
│  - Customer Number    │
│  - Profile Card       │
│  - Login Data Card    │
│  - Contact Data Card  │
│  - Documents Card     │
│  - Danger Zone        │
└───────────────────────┘
```

---

## 🔧 Features to Implement

### Priority 1: Critical (Must Have)
```
✅ Customer Number Display
✅ Profile Picture Upload
✅ Email Verification Badge
✅ Phone Verification System
✅ Password Change Modal
✅ Address Management
✅ Privacy Settings (who can see what)
```

### Priority 2: Important (Should Have)
```
✅ Invoices Section
✅ Download Invoices
✅ Account Deletion Flow
✅ Registration Year Display
✅ Last Login Display
✅ Account Type Badge (Private/Dealer/Company)
```

### Priority 3: Nice to Have (Could Have)
```
✅ Activity Log
✅ Security Settings (2FA)
✅ Connected Devices
✅ API Keys Management
✅ Export Data (GDPR)
```

---

## 🎯 Implementation Steps

### Phase 1: Foundation (Week 1)
1. ✅ Create new ProfileSettings component
2. ✅ Design system setup (colors, typography, spacing)
3. ✅ Card components (reusable)
4. ✅ Badge components (verified/not verified)
5. ✅ Button components (primary/secondary/danger)

### Phase 2: Core Features (Week 2)
1. ✅ Customer Number generation & display
2. ✅ Profile Picture upload & management
3. ✅ Email verification system
4. ✅ Phone verification system
5. ✅ Password change functionality

### Phase 3: Data Management (Week 3)
1. ✅ Address form & validation
2. ✅ Contact data management
3. ✅ Privacy settings
4. ✅ Account deletion flow
5. ✅ Invoices section

### Phase 4: Polish & Testing (Week 4)
1. ✅ Responsive design
2. ✅ Accessibility (WCAG 2.1)
3. ✅ Performance optimization
4. ✅ User testing & feedback
5. ✅ Bug fixes & refinements

---

## 📊 Success Metrics

### User Experience
- Page load time < 2 seconds
- Time to complete profile < 5 minutes
- Verification completion rate > 70%

### Technical
- Lighthouse Score > 90
- Zero accessibility errors
- Mobile-first responsive
- Cross-browser compatible

---

## 🎨 Visual Examples

### Customer Number Badge
```
┌──────────────────────────────────────┐
│  👤  Your customer number is:        │
│      27765111                         │
└──────────────────────────────────────┘
```

### Verification Status
```
Email: alaa.hamdani@yahoo.com  [✓ Confirmed]
Phone: (+49) 1521 4037403      [⚠ Not confirmed] [Confirm now]
```

### Delete Account Section
```
┌─────────────────────────────────────────────┐
│  🗑️ Delete account                          │
│                                             │
│  alaa.hamdani@yahoo.com                     │
│  Private account, registered since 2021     │
│                                             │
│  [Delete Account]                           │
│  ⚠️ Warning: This action is irreversible!   │
└─────────────────────────────────────────────┘
```

---

## ✅ الخلاصة

### ما سيتم تطبيقه:
1. **تصميم نظيف ومنظم** مثل mobile.de
2. **شارات التحقق** للثقة والمصداقية
3. **بطاقات منفصلة** لكل قسم
4. **أزرار واضحة** للإجراءات
5. **حالات مرئية** (مؤكد/غير مؤكد)
6. **منطقة الخطر** لحذف الحساب
7. **رقم عميل مميز** لكل مستخدم
8. **صورة شخصية قابلة للتعديل**
9. **نظام التحقق الكامل** (Email + Phone)
10. **قسم المستندات** للفواتير

---

**تاريخ الخطة:** 28 أكتوبر 2024  
**المستوحاة من:** mobile.de  
**الحالة:** جاهز للتطبيق ✅
