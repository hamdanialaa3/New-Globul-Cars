# 🔖 Identity Stamp Component - Documentation

> **File**: `src/components/Profile/IdentityStamp.tsx`  
> **Usage**: Professional verification stamp for user profiles  
> **Created**: December 24, 2025  
> **Status**: Production Ready

---

## 📖 **Overview**

The **Identity Stamp** is a professional, ink-style verification seal that displays user information in a circular, official-looking format. It's inspired by traditional government stamps but with a modern, digital aesthetic.

### **Visual Design**
- **Style**: Neumorphism + Ink Bleed Effect (realistic stamp texture)
- **Color**: Navy Blue (`rgba(28, 49, 116, 0.88)`) - traditional stamp color
- **Rotation**: -5° for authentic stamp appearance
- **Animation**: Scales on data update to simulate "stamping" action

---

## 🎯 **Features**

### **1. Real-Time Data Binding**
The stamp automatically updates when user information changes:
- **First Name** & **Last Name** (Inner circle)
- **Email** & **Phone** (Middle circle)
- **Region**, **City**, **Address** (Outer circle)
- **Numeric ID** (Center box, formatted as 000000)

### **2. Visual Effects**
- **Ink Bleed Filter**: SVG filter creates realistic ink spreading effect
- **Grain Texture**: Adds paper-like texture to the stamp
- **Rotation Animation**: Stamp "presses" when data updates (scale 1 → 1.1 → 1)

### **3. Responsive Design**
- **Desktop**: 280x280px
- **Mobile**: 220x220px
- Centered on mobile devices

---

## 🔧 **Usage**

### **Basic Import**
```tsx
import IdentityStamp from '@/components/Profile/IdentityStamp';
```

### **Example: Settings Page**
```tsx
<IdentityStamp
  firstName={userInfo.firstName || 'FIRST NAME'}
  lastName={userInfo.lastName || 'LAST NAME'}
  email={userInfo.email || 'EMAIL@EXAMPLE.COM'}
  phone={userInfo.phoneNumber || '+359 00 000 000'}
  region={userInfo.region || 'REGION'}
  city={userInfo.city || 'CITY'}
  address={userInfo.address || 'ADDRESS'}
  numericId={user?.numericId || 0}
/>
```

### **Props Interface**
```typescript
interface IdentityStampProps {
  firstName?: string;    // Default: 'FIRST NAME'
  lastName?: string;     // Default: 'LAST NAME'
  email?: string;        // Default: 'EMAIL@EXAMPLE.COM'
  phone?: string;        // Default: '+359 00 000 000'
  region?: string;       // Default: 'REGION'
  city?: string;         // Default: 'CITY'
  address?: string;      // Default: 'ADDRESS'
  numericId?: number;    // Default: 0, formatted as 000000
}
```

---

## 🎨 **Stamp Structure**

### **Circular Rings (Outside → Inside)**

1. **Outer Ring**: `REGION • CITY • ADDRESS`
   - Font: Exo 2, 700 weight
   - Size: 13px
   - Letter Spacing: 3px

2. **Middle Ring**: `EMAIL • PHONE`
   - Font: Exo 2, 700 weight
   - Size: 11px
   - Letter Spacing: 4px

3. **Inner Ring**: `FIRST NAME • LAST NAME`
   - Font: Exo 2, 900 weight
   - Size: 15px
   - Letter Spacing: 5px

### **Center Box**
- **Top Text**: `mobilebg.eu` (static)
  - Font: Exo 2, 900 weight, 18px
- **Bottom Text**: `000090` (numeric ID)
  - Font: JetBrains Mono, 700 weight, 28px
  - Formatted: Always 6 digits (padded with zeros)

### **Decorative Elements**
- **Stars**: ★ on left and right sides
- **Serrated Border**: Outer dashed circle (stamp edge effect)
- **Divider Lines**: Separate text rings

---

## 🔄 **Animation Behavior**

### **Update Animation** (useEffect)
When any prop changes:
1. Scale increases to `1.1` (150ms)
2. Scale returns to `1` (smooth transition)
3. Simulates physical stamp pressing action

### **Click Animation** (CSS :active)
- Scale: `0.98`
- Duration: Instant (while pressed)

---

## 🖼️ **SVG Filter Details**

### **Ink Bleed Effect** (`#ink-bleed-pro`)
```xml
<filter id="ink-bleed-pro">
  <!-- Edge Turbulence -->
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="5" />
  
  <!-- Displacement (Ink Spread) -->
  <feDisplacementMap scale="2.5" />
  
  <!-- Opacity Variation (Ink Intensity) -->
  <feComponentTransfer>
    <feFuncA type="discrete" tableValues="0 0.6 0.8 1" />
  </feComponentTransfer>
  
  <!-- Slight Blur (Ink Absorption) -->
  <feGaussianBlur stdDeviation="0.2" />
</filter>
```

---

## 📱 **Responsive Breakpoints**

### **Desktop (≥1200px)**
- Stamp: 280x280px
- Position: Right side of form
- Grid: `1fr 300px`

### **Tablet/Mobile (<1200px)**
- Stamp: 220x220px
- Position: Centered below form
- Grid: Single column (`1fr`)

---

## 🎯 **Integration Points**

### **Current Usage**
- **Settings Page** (`SettingsTab.tsx`)
  - Location: Right side of Account section
  - Updates: Real-time as user types in form fields

### **Potential Future Uses**
- User profile pages (public view)
- Dealer verification badges
- Company profile cards
- Printable ID cards

---

## 🔒 **Data Source**

### **Numeric ID Format**
```typescript
// URL: http://localhost:3000/profile/90
// Numeric ID: 90
// Stamp Display: "000090"

const formattedId = numericId.toString().padStart(6, '0').slice(-6);
```

### **Text Transformation**
All text is automatically converted to **UPPERCASE** for official stamp appearance.

---

## 🎨 **Styling Customization**

### **Change Stamp Color**
Modify the `stroke` color in `IdentityStamp.tsx`:
```tsx
// Current: Navy Blue
stroke="rgba(28, 49, 116, 0.88)"

// Example: Red
stroke="rgba(220, 38, 38, 0.88)"
```

### **Adjust Rotation**
Change the `transform` in `StampContainer`:
```tsx
transform: rotate(-5deg);  // Current
transform: rotate(-15deg); // More tilted
```

### **Modify Size**
```tsx
// Desktop
width: 280px;
height: 280px;

// Mobile
@media (max-width: 968px) {
  width: 220px;
  height: 220px;
}
```

---

## ⚠️ **Important Notes**

### **1. Font Fallbacks**
- Primary: `'Exo 2'` (Google Font - load via CDN if needed)
- Fallback: `'Arial', sans-serif`
- Monospace: `'JetBrains Mono'` → `'Courier New', monospace`

### **2. Performance**
- SVG filters are GPU-accelerated (good performance)
- Animation only triggers on prop changes (optimized)

### **3. Accessibility**
- Current: Decorative only (no ARIA labels)
- Future: Add `role="img"` and `aria-label` for screen readers

---

## 🐛 **Troubleshooting**

### **Stamp Not Displaying**
- Check `numericId` is passed correctly
- Verify user object has required fields
- Check console for React errors

### **Text Overlapping**
- Issue: Long city/address names
- Solution: Text automatically wraps in circular path
- Recommendation: Keep addresses under 30 characters

### **Filter Not Working**
- Ensure SVG `<filter>` is rendered before stamp
- Check browser support for SVG filters (IE11 not supported)

---

## 📚 **References**

- **SVG Filters**: [MDN SVG Filter Effects](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
- **TextPath**: [MDN textPath Element](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath)
- **Styled Components**: [Official Docs](https://styled-components.com/)

---

*This component is part of the Bulgarian Car Marketplace design system.*
