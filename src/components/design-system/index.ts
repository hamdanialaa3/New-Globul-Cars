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
// New Components (Phase 2) - مكونات جديدة
// ─────────────────────────────────────────────────────────────────────────
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';


// ═══════════════════════════════════════════════════════════════════════════
// 📋 QUICK START GUIDE - دليل البدء السريع
// ═══════════════════════════════════════════════════════════════════════════
/*

1️⃣ IMPORT COMPONENTS:
───────────────────────
import { Button, Input, Card, CardBody, Badge, Avatar } from '@/components/design-system';


2️⃣ USE IN YOUR PAGE:
──────────────────────
function MyPage() {
  return (
    <Card>
      <CardBody>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Avatar name="John Doe" />
            <Input label="Email" placeholder="your@email.com" />
        </div>
        <Badge variant="success">New</Badge>
        <Button>Submit</Button>
      </CardBody>
    </Card>
  );
}


3️⃣ TYPESCRIPT SUPPORT:
────────────────────────
import { ButtonProps } from '@/components/design-system';
import { logger } from '../../services/logger-service';


const customButton: ButtonProps = {
  variant: 'primary',
  size: 'lg',
  onClick: () => logger.info('Clicked!');,
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
