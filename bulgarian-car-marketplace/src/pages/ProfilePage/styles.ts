import styled from 'styled-components';

// Main Profile Container
export const ProfileContainer = styled.div<{ $isBusinessMode?: boolean }>`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  background-image: url('/assets/backgrounds/metal-bg-3.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $isBusinessMode }) => 
      $isBusinessMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(249, 250, 251, 0.92)'
    };
    z-index: 0;
    filter: blur(1px);
  }
`;

// Page Container
export const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 2;
`;

// Page Header
export const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.base};

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
  }
`;

// Profile Grid Layout
export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${({ theme }) => theme.spacing['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Profile Sidebar
export const ProfileSidebar = styled.div<{ $isBusinessMode?: boolean }>`
  background: ${({ theme, $isBusinessMode }) => 
    $isBusinessMode 
      ? 'rgba(255, 255, 255, 0.95)' 
      : theme.colors.background.paper
  };
  backdrop-filter: ${({ $isBusinessMode }) => 
    $isBusinessMode ? 'blur(20px) saturate(180%)' : 'none'
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme, $isBusinessMode }) => 
    $isBusinessMode
      ? '0 8px 32px rgba(30, 58, 138, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)'
      : theme.shadows.base
  };
  height: fit-content;
  position: relative;
  z-index: 1;
`;

// Profile Avatar Section
export const ProfileAvatar = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    color: ${({ theme }) => theme.colors.primary.contrastText};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }

  .name {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .email {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

// Profile Statistics Grid
export const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

// Individual Stat Item
export const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.grey[50]};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  .stat-number {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.main};
    display: block;
  }

  .stat-label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

// Profile Actions Container
export const ProfileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Action Button with Variants
export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: 1.5px solid ${({ theme, variant }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.grey[300];
      case 'danger':
        return theme.colors.error.main;
      default:
        return theme.colors.primary.main;
    }
  }};
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'secondary':
        return 'transparent';
      case 'danger':
        return theme.colors.error.main;
      default:
        return theme.colors.primary.main;
    }
  }};
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.text.primary;
      case 'danger':
        return theme.colors.error.contrastText;
      default:
        return theme.colors.primary.contrastText;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: 0.85rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${({ theme, variant }) => {
      switch (variant) {
        case 'secondary':
          return theme.colors.grey[100];
        case 'danger':
          return theme.colors.error.dark;
        default:
          return theme.colors.primary.dark;
      }
    }};
    border-color: ${({ theme, variant }) => {
      switch (variant) {
        case 'secondary':
          return theme.colors.grey[400];
        case 'danger':
          return theme.colors.error.dark;
        default:
          return theme.colors.primary.dark;
      }
    }};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

// Profile Content Area
export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['2xl']};
`;

// Content Section
export const ContentSection = styled.div<{ $isBusinessMode?: boolean }>`
  background: ${({ theme, $isBusinessMode }) => 
    $isBusinessMode 
      ? 'rgba(255, 255, 255, 0.95)' 
      : theme.colors.background.paper
  };
  backdrop-filter: ${({ $isBusinessMode }) => 
    $isBusinessMode ? 'blur(20px) saturate(180%)' : 'none'
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme, $isBusinessMode }) => 
    $isBusinessMode
      ? '0 8px 32px rgba(30, 58, 138, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)'
      : theme.shadows.base
  };
  position: relative;
  z-index: 1;
`;

// Section Header
export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }

  .edit-btn {
    padding: 6px 12px;
    background: ${({ theme }) => theme.colors.primary.main};
    color: ${({ theme }) => theme.colors.primary.contrastText};
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 4px rgba(255, 121, 0, 0.2);

    &:hover {
      background: ${({ theme }) => theme.colors.primary.dark};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 121, 0, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(255, 121, 0, 0.2);
    }
  }
`;

// Form Grid Layout
export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.xs};
`;

// Form Group
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  label {
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 11px;
  }

  input, select, textarea {
    padding: 6px 10px;
    border: 1px solid ${({ theme }) => theme.colors.grey[300]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    font-size: 13px;
    background: ${({ theme }) => theme.colors.background.paper};
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}20;
    }

    &::placeholder {
      color: #b0b0b0;
      font-size: 12px;
      opacity: 0.7;
    }
  }

  textarea {
    resize: vertical;
    min-height: 70px;
  }
`;

// Form Actions
export const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing['2xl']};
  padding-top: ${({ theme }) => theme.spacing['2xl']};
  border-top: 1px solid ${({ theme }) => theme.colors.grey[200]};
`;

// Save Button
export const SaveButton = styled.button`
  padding: 10px 20px;
  background: ${({ theme }) => theme.colors.success.main};
  color: ${({ theme }) => theme.colors.success.contrastText};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);

  &:hover {
    background: ${({ theme }) => theme.colors.success.dark};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(76, 175, 80, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Cancel Button
export const CancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.grey[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  &:hover {
    background: ${({ theme }) => theme.colors.grey[100]};
    border-color: ${({ theme }) => theme.colors.grey[400]};
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
`;

// Cars List Grid
export const CarsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Individual Car Card
export const CarCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.grey[200]};
  transition: box-shadow 0.2s ease-in-out;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.base};
  }

  .car-image {
    width: 100%;
    height: 150px;
    background: ${({ theme }) => theme.colors.grey[200]};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .car-title {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  .car-price {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .car-details {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .car-actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};

    .action-btn {
      flex: 1;
      padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
      background: ${({ theme }) => theme.colors.primary.main};
      color: ${({ theme }) => theme.colors.primary.contrastText};
      border: none;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      cursor: pointer;
      transition: background 0.2s ease-in-out;

      &:hover {
        background: ${({ theme }) => theme.colors.primary.dark};
      }
    }
  }
`;

// Empty State
export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  color: ${({ theme }) => theme.colors.text.secondary};

  .empty-icon {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: block;
  }

  .empty-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .empty-description {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  }
`;