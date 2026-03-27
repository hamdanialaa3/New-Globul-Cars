// ملف أنماط صفحة البحث المتقدم - نظام ألوان مرن مع تحكم كامل بالحجم
// جميع التعليقات بالعربي لسهولة الصيانة

import styled from 'styled-components';

// 🎨 ألوان افتراضية قابلة لإعادة الاستخدام
export const defaultColors = {
  primary: 'var(--accent-primary, #3B82F6)',
  secondary: 'var(--bg-secondary, #1A1F2E)',
  text: 'var(--text-primary, #1A1D2E)',
  textSecondary: 'var(--text-secondary, #6b7280)',
  background: 'var(--bg-primary, #FAFBFC)',
  card: 'var(--bg-card, #FFFFFF)',
  border: 'var(--border-primary, #E2E8F0)',
  accent: 'var(--accent-orange, #3B82F6)',
  muted: 'var(--bg-hover, #F5F7FA)',
  success: 'var(--success, #10B981)',
  error: 'var(--error, #EF4444)'
};

// 🧱 الحاوية الرئيسية
export const SearchContainer = styled.div<{
  bgColor?: string;
  paddingY?: string;
}>`
  min-height: 100vh;
  background: ${({ bgColor }) => bgColor || defaultColors.background};
  padding: ${({ paddingY }) => paddingY || '24px'} 0;
  direction: ltr;
  --as-card: ${defaultColors.card};
  --as-border: ${defaultColors.border};
  --as-text: ${defaultColors.text};
  --as-text-secondary: ${defaultColors.textSecondary};
  --as-accent: ${defaultColors.accent};
`;

// 📦 حاوية المحتوى
export const Container = styled.div<{ maxWidth?: string }>`
  max-width: ${({ maxWidth }) => maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 16px;
  direction: ltr;
`;

// 📰 رأس الصفحة
export const HeaderSection = styled.div<{
  titleSize?: string;
  descSize?: string;
  titleColor?: string;
  descColor?: string;
}>`
  margin-bottom: 24px;
  text-align: left;

  h1 {
    font-size: ${({ titleSize }) => titleSize || '1.4rem'};
    color: ${({ titleColor }) => titleColor || defaultColors.text};
    font-weight: 600;
    margin: 0 0 8px;
  }

  p {
    font-size: ${({ descSize }) => descSize || '0.85rem'};
    color: ${({ descColor }) => descColor || defaultColors.textSecondary};
    margin: 0;
  }
`;

// 🧾 نموذج البحث
export const SearchForm = styled.form<{
  cardColor?: string;
  borderColor?: string;
  radius?: string;
}>`
  background: ${({ cardColor }) => cardColor || 'var(--as-card)'};
  border: 1px solid ${({ borderColor }) => borderColor || 'var(--as-border)'};
  border-radius: ${({ radius }) => radius || '16px'};
  margin-bottom: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  overflow: hidden;
`;

export const SectionCard = styled.div`
  border-bottom: 1px solid var(--as-border);

  &:last-child {
    border-bottom: none;
  }
`;

// ⬇️ رأس كل قسم
export const SectionHeader = styled.div<{
  $isOpen: boolean;
  padding?: string;
}>`
  background: ${({ $isOpen }) => ($isOpen ? '#2b3142' : 'var(--as-card)')};
  padding: ${({ padding }) => padding || '16px 20px'};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease, border-color 0.2s ease;
  border: 1px solid ${({ $isOpen }) => ($isOpen ? defaultColors.accent : 'var(--as-border)')};

  &:hover {
    background: var(--bg-hover);
  }
`;

export const SectionContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '2200px' : '0')};
  overflow: hidden;
  transition: max-height 0.35s ease;
  background: var(--as-card);
`;

export const SectionBody = styled.div<{ padding?: string }>`
  padding: ${({ padding }) => padding || '20px'};
`;

export const SectionTitle = styled.h3<{
  color?: string;
  size?: string;
}>`
  font-size: ${({ size }) => size || '0.85rem'};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ color }) => color || defaultColors.textSecondary};
  margin: 0;
`;

export const ExpandIcon = styled.span<{
  $isOpen: boolean;
  iconSize?: string;
  iconColor?: string;
}>`
  font-size: ${({ iconSize }) => iconSize || '1rem'};
  color: ${({ iconColor }) => iconColor || defaultColors.accent};
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;
  text-shadow: 0 0 8px ${({ iconColor }) => iconColor || defaultColors.accent};

  &::before {
    content: '▼';
  }
`;

// 🧮 شبكة الحقول
export const FormGrid = styled.div<{ gap?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ gap }) => gap || '16px'};
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormGroup = styled.div<{
  labelColor?: string;
  labelSize?: string;
}>`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: ${({ labelSize }) => labelSize || '0.78rem'};
    font-weight: 500;
    color: ${({ labelColor }) => labelColor || defaultColors.textSecondary};
    letter-spacing: 0.04em;
  }
`;

const baseFieldStyles = `
  width: 100%;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--as-border);
  color: var(--as-text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);

  &:focus {
    outline: none;
    border-color: ${defaultColors.accent};
    box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.15);
  }
`;

export const SearchInput = styled.input<{
  fontSize?: string;
  height?: string;
}>`
  ${baseFieldStyles}
  padding: 12px 16px;
  font-size: ${({ fontSize }) => fontSize || '0.9rem'};
  height: ${({ height }) => height || '44px'};

  &::placeholder {
    color: var(--as-text-secondary);
  }
`;

export const SearchSelect = styled.select<{
  fontSize?: string;
  height?: string;
}>`
  ${baseFieldStyles}
  padding: 12px 16px;
  font-size: ${({ fontSize }) => fontSize || '0.9rem'};
  height: ${({ height }) => height || '44px'};
  cursor: pointer;

  option {
    background: var(--bg-card);
    color: var(--text-primary);
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

export const CheckboxLabel = styled.label<{
  textSize?: string;
}>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--as-border);
  color: var(--as-text);
  font-size: ${({ textSize }) => textSize || '0.8rem'};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--as-accent);
  }

  input {
    display: none;
  }
`;

export const CustomCheckbox = styled.div<{ checked: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid ${({ checked }) => (checked ? defaultColors.success : defaultColors.muted)};
  background: ${({ checked }) => (checked ? defaultColors.success : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '✓';
    font-size: 12px;
    color: white;
    opacity: ${({ checked }) => (checked ? 1 : 0)};
    transform: ${({ checked }) => (checked ? 'scale(1)' : 'scale(0.4)')};
    transition: all 0.15s ease;
  }
`;

export const RangeGroup = styled.div<{
  labelColor?: string;
  labelSize?: string;
}>`
  display: flex;
  gap: 8px;
  align-items: center;

  span {
    color: ${({ labelColor }) => labelColor || defaultColors.textSecondary};
    font-size: ${({ labelSize }) => labelSize || '0.75rem'};
    white-space: nowrap;
  }

  input {
    flex: 1;
  }
`;

export const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--as-border);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchButton = styled.button<{
  fontSize?: string;
}>`
  flex: 0 0 auto;
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ff6b00, #ff3d71);
  color: white;
  font-size: ${({ fontSize }) => fontSize || '0.95rem'};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(255, 77, 79, 0.3);
  }
`;

export const ResetButton = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid var(--as-border);
  background: transparent;
  color: var(--as-text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--as-accent);
  }
`;

export const ResultsSummary = styled.div`
  background: var(--as-card);
  border: 1px solid var(--as-border);
  border-radius: 16px;
  padding: 32px;
  margin-top: 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);

  h4 {
    color: var(--as-accent);
    font-size: 1rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  p {
    color: var(--as-text-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;
