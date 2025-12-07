// ═══════════════════════════════════════════════════════════════════════════
// 🎨 Design System - Main Export
// نظام التصميم - التصدير الرئيسي
// 
// Purpose: Centralized export for all Design System components
// الهدف: تصدير مركزي لجميع مكونات نظام التصميم
// 
// Usage: import { Button, Input, Card } from '@/components/design-system';
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────
// Core Components - المكونات الأساسية
// ─────────────────────────────────────────────────────────────────────────
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps, InputSize, InputVariant } from './Input';

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardVariant, CardPadding } from './Card';

// ─────────────────────────────────────────────────────────────────────────
// Future Components (Coming Soon)
// مكونات مستقبلية (قريباً)
// ─────────────────────────────────────────────────────────────────────────
// export { Select } from './Select';
// export { Checkbox } from './Checkbox';
// export { Radio } from './Radio';
// export { Toggle } from './Toggle';
// export { Modal } from './Modal';
// export { Dropdown } from './Dropdown';
// export { Badge } from './Badge';
// export { Avatar } from './Avatar';
// export { Tooltip } from './Tooltip';
// export { Alert } from './Alert';

// ═══════════════════════════════════════════════════════════════════════════
// 📋 QUICK START GUIDE - دليل البدء السريع
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ IMPORT COMPONENTS:
───────────────────────
import { Button, Input, Card, CardBody } from '@/components/design-system';


2️⃣ USE IN YOUR PAGE:
──────────────────────
function MyPage() {
  return (
    <Card>
      <CardBody>
        <Input label="Email" placeholder="your@email.com" />
        <Button>Submit</Button>
      </CardBody>
    </Card>
  );
}


3️⃣ TYPESCRIPT SUPPORT:
────────────────────────
import { ButtonProps } from '@/components/design-system';

const customButton: ButtonProps = {
  variant: 'primary',
  size: 'lg',
  onClick: () => console.log('Clicked!'),
};


4️⃣ THEME ACCESS:
──────────────────
All components automatically access theme.v2.ts colors and tokens.
No manual theme provider needed - styled-components handles it!

*/

// ═══════════════════════════════════════════════════════════════════════════
// ✅ DESIGN SYSTEM BENEFITS:
// فوائد نظام التصميم:
// 
// 1. Consistency - اتساق في جميع الصفحات
// 2. Speed - سرعة في التطوير (مكونات جاهزة)
// 3. Accessibility - إمكانية الوصول مدمجة
// 4. Type Safety - أمان الأنواع مع TypeScript
// 5. Maintainability - سهولة الصيانة (تعديل مركزي)
// 6. Documentation - توثيق مدمج في الأمثلة
// 7. Scalability - قابلية التوسع (إضافة مكونات جديدة)
// ═══════════════════════════════════════════════════════════════════════════
