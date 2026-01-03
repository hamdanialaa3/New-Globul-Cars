# 🎨 Modern Design System - Quick Reference
## دليل سريع لنظام التصميم الحديث

---

## 🎯 Quick Start

```typescript
// 1. Import the design system
import {
  colors,
  ModernButton,
  GlassCard,
  ModernInput,
  FloatingLabel,
  ModernInputWrapper,
  ModernBadge
} from '@/components/SellWorkflow/ModernDesignSystem';

// 2. Use components
<ModernButton variant="primary" icon={<Check />}>
  احفظ
</ModernButton>
```

---

## 🎨 Color Palette / لوحة الألوان

```typescript
// Primary - Orange (Automotive Energy)
colors.primary.DEFAULT  // #FF6B35
colors.primary.light    // #FF8C61
colors.primary.dark     // #E55A2B

// Secondary - Blue (Trust & Reliability)
colors.secondary.DEFAULT // #004E89
colors.secondary.light   // #006BB8
colors.secondary.dark    // #003861

// Semantic Colors
colors.success  // #10B981 (Green)
colors.warning  // #F59E0B (Amber)
colors.error    // #EF4444 (Red)
colors.info     // #3B82F6 (Blue)

// Neutrals (10 levels: 50-900)
colors.neutral[50]   // Lightest
colors.neutral[500]  // Medium
colors.neutral[900]  // Darkest
```

---

## 🔘 Buttons / الأزرار

### Variants

```tsx
// Primary - Main actions
<ModernButton variant="primary">نشر الإعلان</ModernButton>

// Secondary - Alternative actions
<ModernButton variant="secondary">حفظ كمسودة</ModernButton>

// Outline - Less emphasis
<ModernButton variant="outline">إلغاء</ModernButton>

// Ghost - Minimal
<ModernButton variant="ghost">تعديل</ModernButton>

// Danger - Destructive actions
<ModernButton variant="danger">حذف</ModernButton>
```

### Sizes

```tsx
<ModernButton size="small">صغير</ModernButton>
<ModernButton size="medium">متوسط</ModernButton>  // Default
<ModernButton size="large">كبير</ModernButton>
```

### States

```tsx
// Loading
<ModernButton isLoading>جاري الحفظ...</ModernButton>

// Disabled
<ModernButton disabled>غير متاح</ModernButton>

// With Icon
<ModernButton icon={<Check />}>تم</ModernButton>
```

---

## 💎 Glass Cards / البطاقات الزجاجية

```tsx
// Basic glass card
<GlassCard>
  <h3>العنوان</h3>
  <p>المحتوى هنا...</p>
</GlassCard>

// With elevation
<GlassCard elevation="high">
  محتوى مميز بظل أكبر
</GlassCard>

// Interactive (with hover)
<GlassCard interactive>
  بطاقة تفاعلية
</GlassCard>

// Custom padding
<GlassCard padding="large">
  محتوى بمساحة كبيرة
</GlassCard>
```

### Elevation Levels

- `low` - Subtle shadow
- `medium` - Standard elevation (default)
- `high` - Prominent shadow

---

## 📝 Form Inputs / حقول الإدخال

### Text Input with Floating Label

```tsx
<ModernInputWrapper>
  <ModernInput 
    type="text"
    placeholder=" "  // ⚠️ Required for floating effect
    value={value}
    onChange={handleChange}
  />
  <FloatingLabel>اسم السيارة</FloatingLabel>
</ModernInputWrapper>
```

### Select Dropdown

```tsx
<ModernInputWrapper>
  <ModernSelect 
    value={value}
    onChange={handleChange}
  >
    <option value="">اختر...</option>
    <option value="toyota">تويوتا</option>
    <option value="bmw">بي ام دبليو</option>
  </ModernSelect>
  <FloatingLabel>الماركة</FloatingLabel>
</ModernInputWrapper>
```

### Input States

```tsx
// Error state
<ModernInputWrapper className="error">
  <ModernInput value={value} />
  <FloatingLabel>البريد الإلكتروني</FloatingLabel>
  <ErrorMessage>البريد الإلكتروني غير صحيح</ErrorMessage>
</ModernInputWrapper>

// Success state
<ModernInputWrapper className="success">
  <ModernInput value={value} />
  <FloatingLabel>رقم الهاتف</FloatingLabel>
  <SuccessIcon />
</ModernInputWrapper>
```

---

## 🏷️ Badges / الشارات

```tsx
// Success badge
<ModernBadge variant="success">منشور</ModernBadge>

// Warning badge
<ModernBadge variant="warning">مسودة</ModernBadge>

// Error badge
<ModernBadge variant="error">محذوف</ModernBadge>

// Info badge
<ModernBadge variant="info">جديد</ModernBadge>

// Custom badge
<ModernBadge variant="custom">مخصص</ModernBadge>
```

---

## 🎭 Animations / الحركات

### Available Keyframes

```typescript
// Import animations
import { 
  ripple,        // Button click effect
  scaleIn,       // Zoom entrance
  slideUpFadeIn, // Slide from bottom
  shimmer,       // Loading effect
  pulseGlow,     // Attention grabber
  float          // Gentle hover
} from '@/components/SellWorkflow/ModernDesignSystem';
```

### Usage Example

```typescript
import styled, { keyframes } from 'styled-components';
import { scaleIn } from './ModernDesignSystem';

const AnimatedDiv = styled.div`
  animation: ${scaleIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
`;
```

---

## 🎨 Glassmorphism Pattern / نمط التأثير الزجاجي

### Standard Glass Effect

```css
background: ${({ theme }) => 
  theme.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'
};
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid ${({ theme }) => 
  theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
};
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### With Gradient Border

```css
border: 2px solid transparent;
background: 
  linear-gradient(white, white) padding-box,
  linear-gradient(135deg, #FF6B35, #004E89) border-box;
```

---

## 🌈 Gradient Text / النص المتدرج

```css
background: linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
font-weight: 800;
```

---

## 📱 Responsive Breakpoints / نقاط التجاوب

```css
/* Mobile First */
@media (max-width: 480px)  { /* Small phones */ }
@media (max-width: 640px)  { /* Phones */ }
@media (max-width: 768px)  { /* Tablets */ }
@media (max-width: 896px)  { /* Large phones landscape */ }
@media (max-width: 1024px) { /* Small laptops */ }
```

### Example

```css
const Component = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;
```

---

## 🎯 Layout Utilities / أدوات التخطيط

### Container

```tsx
<Container maxWidth="lg">
  محتوى محدود العرض
</Container>
```

Max-width options:
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px

### Grid System

```tsx
<Grid 
  columns={3}           // Number of columns
  gap="1rem"           // Gap between items
  minColumnWidth="250px" // Responsive columns
>
  <div>عنصر 1</div>
  <div>عنصر 2</div>
  <div>عنصر 3</div>
</Grid>
```

### Flex Utilities

```tsx
<Flex 
  direction="row"       // row | column
  justify="center"      // start | center | end | between | around
  align="center"        // start | center | end | stretch
  gap="1rem"
  wrap="wrap"           // nowrap | wrap
>
  <div>عنصر</div>
  <div>عنصر</div>
</Flex>
```

---

## ⏳ Loading States / حالات التحميل

### Spinner

```tsx
import { LoadingSpinner } from './ModernDesignSystem';

<LoadingSpinner size="medium" color={colors.primary.DEFAULT} />
```

Sizes: `small` | `medium` | `large`

### Skeleton Loader

```tsx
import { SkeletonLoader } from './ModernDesignSystem';

<SkeletonLoader width="100%" height="50px" />
```

---

## 🎨 Shadow System / نظام الظلال

### Multi-Layer Shadows

```css
/* Subtle */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Standard */
box-shadow: 
  0 4px 6px rgba(0, 0, 0, 0.1),
  0 2px 4px rgba(0, 0, 0, 0.06);

/* Elevated */
box-shadow: 
  0 10px 30px rgba(0, 0, 0, 0.12),
  0 4px 12px rgba(0, 0, 0, 0.08);

/* Prominent */
box-shadow: 
  0 20px 60px rgba(0, 0, 0, 0.15),
  0 10px 30px rgba(0, 0, 0, 0.1);
```

### Colored Glow

```css
/* Orange glow */
box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);

/* Green glow */
box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);

/* Blue glow */
box-shadow: 0 6px 16px rgba(0, 78, 137, 0.4);
```

---

## 🔄 Transitions / الانتقالات

### Easing Functions

```css
/* Bouncy (playful) */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Smooth (elegant) */
cubic-bezier(0.4, 0, 0.2, 1)

/* Ease-out (natural) */
cubic-bezier(0, 0, 0.2, 1)

/* Ease-in (gradual) */
cubic-bezier(0.4, 0, 1, 1)
```

### Standard Transitions

```css
/* All properties */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Specific properties */
transition: 
  transform 0.3s ease,
  opacity 0.2s ease,
  background 0.4s ease;
```

---

## 🎭 Dark Mode Support / دعم الوضع الليلي

```typescript
// Using theme context
const Component = styled.div`
  background: ${({ theme }) => 
    theme.mode === 'dark' 
      ? '#1e293b'   // Dark background
      : '#ffffff'   // Light background
  };
  
  color: ${({ theme }) => 
    theme.mode === 'dark'
      ? '#f8fafc'   // Light text
      : '#1e293b'   // Dark text
  };
`;
```

### Color Recommendations

**Dark Mode:**
- Background: `#0f172a`, `#1e293b`
- Card: `rgba(255, 255, 255, 0.05)`
- Text: `#f8fafc`, `rgba(255, 255, 255, 0.9)`
- Borders: `rgba(255, 255, 255, 0.1)`

**Light Mode:**
- Background: `#ffffff`, `#f8fafc`
- Card: `rgba(255, 255, 255, 0.8)`
- Text: `#1e293b`, `#334155`
- Borders: `rgba(0, 0, 0, 0.1)`

---

## ⚡ Performance Tips / نصائح الأداء

### 1. Use CSS Transforms (GPU Accelerated)

```css
/* ✅ Good */
transform: translateY(-2px);

/* ❌ Avoid */
top: -2px;
```

### 2. Will-Change for Heavy Animations

```css
.animated-element {
  will-change: transform, opacity;
}

/* Remove after animation */
.animated-element.complete {
  will-change: auto;
}
```

### 3. Optimize Backdrop-Filter

```css
/* Only on visible elements */
.glass-card:not(.hidden) {
  backdrop-filter: blur(20px);
}

/* Fallback for unsupported browsers */
@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
  }
}
```

---

## ♿ Accessibility / إمكانية الوصول

### Focus States

```css
button:focus-visible {
  outline: 2px solid ${colors.primary.DEFAULT};
  outline-offset: 2px;
}
```

### Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio

### ARIA Labels

```tsx
<ModernButton 
  aria-label="حفظ التغييرات"
  icon={<Save />}
/>

<ModernInput 
  aria-label="البريد الإلكتروني"
  aria-required="true"
/>
```

---

## 🐛 Common Issues / المشاكل الشائعة

### Issue 1: Floating Label Not Working

**Problem:** Label doesn't float when input has value

**Solution:** Ensure placeholder is set to a space

```tsx
// ❌ Wrong
<ModernInput placeholder="Name" />

// ✅ Correct
<ModernInput placeholder=" " />
```

### Issue 2: Backdrop-Filter Not Working

**Problem:** Glass effect not visible

**Solution:** Check browser support and add fallback

```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(20px);

@supports not (backdrop-filter: blur(20px)) {
  background: rgba(255, 255, 255, 0.95);
}
```

### Issue 3: Animation Janky on Mobile

**Problem:** Animations stuttering

**Solution:** Use transform instead of position, add will-change

```css
/* ✅ Smooth */
.element {
  will-change: transform;
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.element:hover {
  transform: translateY(-5px);
}
```

---

## 📚 More Examples / مزيد من الأمثلة

### Complete Form Example

```tsx
const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: ''
  });

  return (
    <GlassCard padding="large">
      <h2>نموذج تسجيل</h2>
      
      <ModernInputWrapper>
        <ModernInput 
          type="text"
          placeholder=" "
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <FloatingLabel>الاسم الكامل</FloatingLabel>
      </ModernInputWrapper>
      
      <ModernInputWrapper>
        <ModernInput 
          type="email"
          placeholder=" "
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <FloatingLabel>البريد الإلكتروني</FloatingLabel>
      </ModernInputWrapper>
      
      <ModernInputWrapper>
        <ModernSelect 
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="">اختر التصنيف</option>
          <option value="individual">فرد</option>
          <option value="company">شركة</option>
        </ModernSelect>
        <FloatingLabel>التصنيف</FloatingLabel>
      </ModernInputWrapper>
      
      <Flex justify="end" gap="1rem">
        <ModernButton variant="outline">
          إلغاء
        </ModernButton>
        <ModernButton variant="primary" icon={<Check />}>
          حفظ
        </ModernButton>
      </Flex>
    </GlassCard>
  );
};
```

---

## 🔗 Quick Links / روابط سريعة

- [Full Design System](./ModernDesignSystem.tsx)
- [Usage Examples](./UI_REDESIGN_REPORT.md)
- [Component Documentation](./COMPONENT_DOCS.md)
- [Styled-Components Docs](https://styled-components.com/)

---

**Last Updated:** January 3, 2026  
**Version:** 2.0.0  
**Maintained by:** Development Team

---

*هذا الدليل السريع يوفر جميع الأنماط والمكونات الأساسية لبناء واجهة عصرية واحترافية* ✨
