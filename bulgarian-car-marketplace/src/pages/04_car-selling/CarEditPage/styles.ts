import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const PageWrapper = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  min-height: 100vh;
  transition: background 0.3s ease;
`;

export const TopBar = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark ? '#1e293b' : '#ffffff'};
  border-bottom: 1px solid ${p => p.$isDark ? '#334155' : '#e2e8f0'};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${p => p.$isDark
    ? '0 4px 6px rgba(0, 0, 0, 0.3)'
    : '0 2px 4px rgba(0, 0, 0, 0.05)'};

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
`;

export const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const BackButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid ${p => p.$isDark ? '#475569' : '#e2e8f0'};
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    background: ${p => p.$isDark ? '#334155' : '#f1f5f9'};
    color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'};
    border-color: ${p => p.$isDark ? '#64748b' : '#cbd5e1'};
  }
`;

export const SaveButton = styled.button<{ $isDark: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 10px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const CancelButton = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid ${p => p.$isDark ? '#ef4444' : '#fca5a5'};
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

export const Container = styled.div<{ $isDark: boolean }>`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const MainSection = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RightColumn = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

export const Card = styled.div<{ $isDark: boolean }>`
  background: ${p => p.$isDark ? '#1e293b' : '#ffffff'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: ${p => p.$isDark
    ? '0 4px 6px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.06)'};
  border: 1px solid ${p => p.$isDark ? '#334155' : '#e2e8f0'};
  transition: all 0.3s ease;
`;

export const SectionTitle = styled.h3<{ $isDark: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'};
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${p => p.$isDark ? '#334155' : '#e2e8f0'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-radius: 2px;
  }
`;

export const ImageSection = styled(Card)``;

export const MainImageContainer = styled.div<{ $isDark: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: ${p => p.$isDark ? '#0f172a' : '#f1f5f9'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 1rem;
`;

export const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ImageNavButton = styled.button<{ $position: 'left' | 'right'; $isDark: boolean }>`
  position: absolute;
  ${p => p.$position}: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${p => p.$isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
  border: 1px solid ${p => p.$isDark ? '#475569' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  backdrop-filter: blur(8px);

  svg { color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'}; }

  &:hover {
    background: #f97316;
    border-color: #f97316;
    svg { color: white; }
  }
`;

export const ThumbnailGrid = styled.div<{ $isDark: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
`;

export const Thumbnail = styled.div<{ $isActive: boolean; $isDark: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${p => p.$isActive ? '#f97316' : 'transparent'};
  opacity: ${p => p.$isActive ? 1 : 0.7};
  transition: all 0.2s;
  background: ${p => p.$isDark ? '#0f172a' : '#f1f5f9'};

  &:hover {
    opacity: 1;
    transform: scale(1.05);
    border-color: ${p => p.$isActive ? '#f97316' : p.$isDark ? '#475569' : '#cbd5e1'};
  }

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const AddImageButton = styled.div<{ $isDark: boolean }>`
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px dashed ${p => p.$isDark ? '#475569' : '#cbd5e1'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)'};

  label { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  svg { color: ${p => p.$isDark ? '#64748b' : '#94a3b8'}; }

  &:hover {
    border-color: #f97316;
    background: rgba(249, 115, 22, 0.1);
    svg { color: #f97316; }
  }
`;

export const RemoveImageButton = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  svg { color: white; }
  &:hover { background: #dc2626; transform: scale(1.1); }
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
  &:last-child { margin-bottom: 0; }
`;

export const Label = styled.label<{ $isDark: boolean }>`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Input = styled.input<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${p => p.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 10px;
  font-size: 15px;
  background: ${p => p.$isDark ? '#0f172a' : '#ffffff'};
  color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'};
  transition: all 0.2s;

  &:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
  &::placeholder { color: ${p => p.$isDark ? '#64748b' : '#94a3b8'}; }
`;

export const Select = styled.select<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${p => p.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 10px;
  font-size: 15px;
  background: ${p => p.$isDark ? '#0f172a' : '#ffffff'};
  color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'};
  cursor: pointer;
  transition: all 0.2s;

  &:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
`;

export const TextArea = styled.textarea<{ $isDark: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${p => p.$isDark ? '#475569' : '#e2e8f0'};
  border-radius: 10px;
  font-size: 15px;
  background: ${p => p.$isDark ? '#0f172a' : '#ffffff'};
  color: ${p => p.$isDark ? '#f1f5f9' : '#1e293b'};
  transition: all 0.2s;
  resize: vertical;
  min-height: 140px;

  &:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
  &::placeholder { color: ${p => p.$isDark ? '#64748b' : '#94a3b8'}; }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

export const CheckboxLabel = styled.label<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: ${p => p.$isDark ? '#cbd5e1' : '#334155'};
`;

export const PriceWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const PriceInput = styled(Input)`
  flex: 1;
`;

export const CurrencySelect = styled(Select)`
  width: 140px;
`;

export const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ThreeColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const EquipmentSection = styled(Card)``;
export const EquipmentCategory = styled.div`
  margin-bottom: 1.5rem;
  &:last-child { margin-bottom: 0; }
`;
export const EquipmentTitle = styled.h4<{ $isDark: boolean }>`
  margin: 0 0 0.75rem 0;
  font-size: 16px;
  color: ${p => p.$isDark ? '#e2e8f0' : '#0f172a'};
`;

export const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
`;

export const EquipmentItem = styled.button<{ $isDark: boolean; $isSelected: boolean }>`
  border: 1px solid ${p => p.$isSelected ? '#22c55e' : (p.$isDark ? '#334155' : '#e2e8f0')};
  background: ${p => p.$isSelected ? 'rgba(34, 197, 94, 0.12)' : (p.$isDark ? '#0f172a' : '#ffffff')};
  color: ${p => p.$isSelected ? '#166534' : (p.$isDark ? '#e2e8f0' : '#0f172a')};
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover { border-color: #22c55e; }
`;

export const ContactSection = styled(Card)``;

export const LoadingOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.75rem;
  color: white;
  z-index: 200;
`;

export const LoadingSpinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #f97316;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const ErrorMessage = styled.div<{ $isDark: boolean; $inline?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p => p.$isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)'};
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: ${p => p.$inline ? '10px 12px' : '14px 16px'};
  border-radius: 10px;
  margin: ${p => p.$inline ? '0 0 0.75rem 0' : '0 0 1rem 0'};
`;

export const SuccessMessage = styled.div<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p => p.$isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(22, 163, 74, 0.08)'};
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 14px 16px;
  border-radius: 10px;
  margin: 0 0 1rem 0;
`;

export const StatusBadge = styled.span<{ $status: string; $isDark: boolean }>`
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: white;
  background: ${p => p.$status === 'active' ? '#22c55e' : p.$status === 'sold' ? '#94a3b8' : p.$status === 'draft' ? '#f59e0b' : '#cbd5e1'};
`;

export const PillGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const PillButton = styled.button<{ $isDark: boolean; $active?: boolean }>`
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid ${p => p.$active ? '#f97316' : (p.$isDark ? '#475569' : '#e2e8f0')};
  background: ${p => p.$active ? 'rgba(249, 115, 22, 0.12)' : (p.$isDark ? '#0f172a' : '#ffffff')};
  color: ${p => p.$isDark ? '#e2e8f0' : '#0f172a'};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;

  &:hover { border-color: #f97316; }
`;

export const ToggleGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ToggleButton = styled.button<{ $isDark: boolean; $active?: boolean }>`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${p => p.$active ? '#22c55e' : (p.$isDark ? '#475569' : '#e2e8f0')};
  background: ${p => p.$active ? 'rgba(34, 197, 94, 0.12)' : (p.$isDark ? '#0f172a' : '#ffffff')};
  color: ${p => p.$active ? '#166534' : (p.$isDark ? '#e2e8f0' : '#0f172a')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
`;

export const InlineFieldRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const InlineHint = styled.div<{ $isDark: boolean }>`
  margin-top: 6px;
  font-size: 12px;
  color: ${p => p.$isDark ? '#94a3b8' : '#64748b'};
`;

export const LoadingCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
