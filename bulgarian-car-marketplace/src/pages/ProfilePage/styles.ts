import styled, { keyframes, css } from 'styled-components';

// ==================== KEYFRAMES ====================

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 143, 16, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 143, 16, 0.5); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==================== MAIN CONTAINER ====================

// Main Profile Container with Metallic Aluminum Background
export const ProfileContainer = styled.div<{ $isBusinessMode?: boolean }>`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing['2xl']} 0;
  
  /* 🎨 Premium Metallic Aluminum Background */
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 143, 16, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.06) 0%, transparent 50%),
    linear-gradient(135deg, 
      #f8f9fa 0%, 
      #eceff1 15%,
      #e3e8ed 30%,
      #dce1e6 45%,
      #d5dbe1 60%,
      #e0e5ea 75%,
      #eaeff4 90%,
      #f5f8fb 100%
    );
  background-size: 100% 100%, 100% 100%, 200% 200%;
  ${css`animation: ${gradientShift} 15s ease infinite;`}
  position: relative;
  overflow: hidden;
  
  /* Brushed Metal Texture Overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0) 0px,
        rgba(255,255,255,0.03) 1px,
        rgba(255,255,255,0) 2px,
        rgba(255,255,255,0) 4px
      ),
      repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0) 0px,
        rgba(0,0,0,0.01) 1px,
        rgba(0,0,0,0) 2px
      );
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  /* Subtle Light Rays */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at top, rgba(255, 223, 122, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(255, 143, 16, 0.08) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
`;

// ==================== PAGE CONTAINER ====================

export const PageContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

// ==================== PROFILE GRID ====================

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${({ theme }) => theme.spacing['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};

  @media (max-width: 968px) {
    grid-template-columns: 280px 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// ==================== PROFILE SIDEBAR ====================

export const ProfileSidebar = styled.div<{ $isBusinessMode?: boolean }>`
  /* 🎨 Premium Glassmorphism with Metallic Frame */
  background: 
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 249, 250, 0.92) 50%,
      rgba(255, 255, 255, 0.90) 100%
    );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  border-radius: 20px;
  padding: ${({ theme }) => theme.spacing['2xl']};
  
  /* Premium Aluminum Border */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.92)),
    linear-gradient(135deg, 
      rgba(192, 192, 192, 0.4) 0%,
      rgba(255, 143, 16, 0.3) 25%,
      rgba(255, 215, 0, 0.5) 50%,
      rgba(255, 143, 16, 0.3) 75%,
      rgba(192, 192, 192, 0.4) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Layered Shadows for Depth */
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 -1px 0 rgba(0, 0, 0, 0.05) inset,
    0 10px 40px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  
  height: fit-content;
  position: sticky;
  top: 20px;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Subtle Yellow Accent Stripe */
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 12px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.4) 15%,
      rgba(255, 235, 59, 0.8) 50%,
      rgba(255, 215, 0, 0.4) 85%,
      rgba(255, 215, 0, 0) 100%
    );
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
    ${css`animation: ${shimmer} 3s linear infinite;`}
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 -1px 0 rgba(0, 0, 0, 0.08) inset,
      0 20px 50px rgba(255, 143, 16, 0.15),
      0 5px 15px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(255, 143, 16, 0.1);
  }

  @media (max-width: 768px) {
  position: relative;
    top: 0;
  }
`;

// ==================== PROFILE AVATAR ====================

export const ProfileAvatar = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF8F10 0%, #FF7900 50%, #FF6600 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    color: white;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    box-shadow: 
      0 8px 32px rgba(255, 143, 16, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1),
      inset 0 2px 4px rgba(255, 255, 255, 0.3);
    border: 3px solid rgba(255, 215, 0, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    ${css`animation: ${float} 3s ease-in-out infinite;`}
    
    &:hover {
      transform: scale(1.08) rotate(5deg);
      ${css`animation: ${pulseGlow} 2s ease-in-out infinite;`}
      box-shadow: 
        0 12px 40px rgba(255, 143, 16, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.15),
        inset 0 -2px 4px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(255, 255, 255, 0.4);
    }
  }

  .name {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, #212529 0%, #495057 50%, #212529 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    ${css`animation: ${gradientShift} 5s ease infinite;`}
  }

  .email {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 500;
  }
`;

// ==================== PROFILE STATS ====================

export const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

export const StatItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  
  /* Glassmorphic Stat Card */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 248, 240, 0.6) 100%
  );
  backdrop-filter: blur(10px) saturate(150%);
  border-radius: 12px;
  border: 1px solid rgba(255, 143, 16, 0.2);
  box-shadow: 
    0 4px 16px rgba(255, 143, 16, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  
  /* Thin Yellow Top Border */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.9) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 2px 2px 0 0;
  }
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px) scale(1.02);
    border-color: rgba(255, 143, 16, 0.4);
    box-shadow: 
      0 8px 24px rgba(255, 143, 16, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(0, 0, 0, 0.08);
  }

  .stat-number {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, #FF8F10 0%, #FFAD33 50%, #FF7900 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
    filter: drop-shadow(0 1px 2px rgba(255, 143, 16, 0.3));
    ${css`animation: ${gradientShift} 4s ease infinite;`}
  }

  .stat-label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: ${({ theme }) => theme.spacing.xs};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

// ==================== PROFILE ACTIONS ====================

export const ProfileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 18px;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  /* Glassmorphic Base */
  ${({ variant }) => {
    switch (variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, 
            rgba(244, 67, 54, 0.9) 0%,
            rgba(211, 47, 47, 0.95) 100%
          );
          border: 1px solid rgba(244, 67, 54, 0.6);
          color: white;
          box-shadow: 
            0 4px 16px rgba(244, 67, 54, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(248, 249, 250, 0.5) 100%
          );
          backdrop-filter: blur(10px) saturate(150%);
          border: 2px solid rgba(255, 143, 16, 0.3);
          color: #495057;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
            
          /* Thin Yellow Top Accent */
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 20%;
            right: 20%;
            height: 2px;
            background: linear-gradient(90deg,
              rgba(255, 215, 0, 0) 0%,
              rgba(255, 215, 0, 0.8) 50%,
              rgba(255, 215, 0, 0) 100%
            );
            border-radius: 2px 2px 0 0;
          }
        `;
      default:
        return css`
          background: linear-gradient(135deg,
            rgba(255, 143, 16, 0.95) 0%,
            rgba(255, 121, 0, 1) 50%,
            rgba(255, 102, 0, 0.98) 100%
          );
          background-size: 200% auto;
          border: 1px solid rgba(255, 215, 0, 0.5);
          color: white;
          box-shadow: 
            0 6px 20px rgba(255, 143, 16, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          animation: ${gradientShift} 3s ease infinite;
          
          /* Shimmer Effect */
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 100%
            );
            animation: ${shimmer} 3s infinite;
          }
        `;
    }
  }}

  &:hover {
    transform: translateY(-3px) scale(1.02);
    ${({ variant }) => {
      switch (variant) {
        case 'danger':
          return `
            box-shadow: 
              0 8px 24px rgba(244, 67, 54, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
          `;
        case 'secondary':
          return `
            border-color: rgba(255, 143, 16, 0.5);
            box-shadow: 
              0 8px 20px rgba(255, 143, 16, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
          `;
        default:
          return `
            box-shadow: 
              0 10px 30px rgba(255, 143, 16, 0.5),
              0 4px 10px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.5),
              inset 0 -1px 0 rgba(0, 0, 0, 0.15);
          `;
      }
    }}
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ==================== CONTENT AREA ====================

export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const ContentSection = styled.div<{ $isBusinessMode?: boolean }>`
  /* 🎨 Premium Glassmorphism Card */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.92) 0%,
    rgba(252, 252, 253, 0.88) 50%,
    rgba(255, 255, 255, 0.90) 100%
  );
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  
  border-radius: 18px;
  padding: ${({ theme }) => theme.spacing['2xl']};
  
  /* Metallic Orange Border */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.92), rgba(252, 252, 253, 0.88)),
    linear-gradient(135deg,
      rgba(200, 200, 200, 0.3) 0%,
      rgba(255, 143, 16, 0.4) 30%,
      rgba(255, 215, 0, 0.6) 50%,
      rgba(255, 143, 16, 0.4) 70%,
      rgba(200, 200, 200, 0.3) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Layered Depth Shadows */
  box-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.03),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Subtle Yellow Glow Bottom */
  &::after {
    content: '';
    position: absolute;
    left: 15%;
    right: 15%;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.5) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 0 0 18px 18px;
    filter: blur(1px);
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 1) inset,
      0 12px 40px rgba(255, 143, 16, 0.12),
      0 4px 10px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(255, 143, 16, 0.08);
  }
`;

// ==================== SECTION HEADER ====================

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  
  /* Gradient Border Bottom */
  border-bottom: 2px solid transparent;
  background-image: 
    linear-gradient(white, white),
    linear-gradient(90deg,
      rgba(255, 143, 16, 0.2) 0%,
      rgba(255, 143, 16, 0.8) 20%,
      rgba(255, 215, 0, 1) 50%,
      rgba(255, 143, 16, 0.8) 80%,
      rgba(255, 143, 16, 0.2) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  position: relative;

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, #212529 0%, #495057 50%, #6c757d 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    ${css`animation: ${gradientShift} 6s ease infinite;`}
  }

  .edit-btn {
    padding: 8px 16px;
    
    /* Glassmorphic Orange Button */
    background: linear-gradient(135deg,
      rgba(255, 143, 16, 0.85) 0%,
      rgba(255, 121, 0, 0.9) 100%
    );
    backdrop-filter: blur(8px);
    color: white;
    border: 1px solid rgba(255, 215, 0, 0.6);
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    
    box-shadow: 
      0 4px 12px rgba(255, 143, 16, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1);
    
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: linear-gradient(135deg,
        rgba(255, 159, 42, 0.9) 0%,
        rgba(255, 143, 16, 0.95) 100%
      );
      transform: translateY(-2px);
      box-shadow: 
        0 6px 20px rgba(255, 143, 16, 0.45),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 8px rgba(255, 143, 16, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }
`;

// ==================== FORM COMPONENTS ====================

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.85rem;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    
    /* Subtle gradient */
    background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  input, select, textarea {
    padding: 10px 14px;
    font-size: 0.95rem;
    border-radius: 10px;
    
    /* Glassmorphic Input */
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(250, 251, 252, 0.7) 100%
    );
    backdrop-filter: blur(8px);
    border: 2px solid rgba(200, 200, 200, 0.3);
    color: ${({ theme }) => theme.colors.text.primary};
    
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus {
      outline: none;
      
      /* Orange Glow on Focus */
      border-color: rgba(255, 143, 16, 0.6);
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 248, 240, 0.9) 100%
      );
      box-shadow: 
        0 0 0 3px rgba(255, 215, 0, 0.25),
        0 4px 16px rgba(255, 143, 16, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    &::placeholder {
      color: #b0b0b0;
      font-size: 0.9rem;
      opacity: 0.6;
      font-weight: 500;
    }
    
    &:disabled {
      background: linear-gradient(135deg,
        rgba(240, 240, 240, 0.8) 0%,
        rgba(235, 235, 235, 0.7) 100%
      );
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  textarea {
    resize: vertical;
    min-height: 90px;
    font-family: inherit;
  }
`;

// ==================== FORM ACTIONS ====================

export const FormActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing['2xl']};
  padding-top: ${({ theme }) => theme.spacing.xl};
  
  /* Gradient Separator */
  border-top: 2px solid transparent;
  background-image: 
    linear-gradient(white, white),
    linear-gradient(90deg,
      rgba(200, 200, 200, 0.2) 0%,
      rgba(255, 143, 16, 0.4) 50%,
      rgba(200, 200, 200, 0.2) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  @media (max-width: 600px) {
    flex-direction: column-reverse;
  }
`;

// ==================== SAVE BUTTON ====================

export const SaveButton = styled.button`
  padding: 14px 28px;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 14px;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
  
  /* Premium Green Gradient */
  background: linear-gradient(135deg,
    rgba(76, 175, 80, 0.95) 0%,
    rgba(67, 160, 71, 1) 50%,
    rgba(56, 142, 60, 0.98) 100%
  );
  background-size: 200% auto;
  color: white;
  
  /* Layered Shadows */
  box-shadow: 
    0 6px 20px rgba(76, 175, 80, 0.35),
    0 2px 6px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${css`animation: ${gradientShift} 3s ease infinite;`}
  
  /* Shimmer Effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    ${css`animation: ${shimmer} 2.5s infinite;`}
  }

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 
      0 10px 30px rgba(76, 175, 80, 0.45),
      0 4px 10px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    animation: none;
  }
`;

// ==================== CANCEL BUTTON ====================

export const CancelButton = styled.button`
  padding: 14px 28px;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 14px;
  cursor: pointer;
  
  /* Glassmorphic Gray */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(248, 249, 250, 0.6) 100%
  );
  backdrop-filter: blur(10px) saturate(140%);
  color: #495057;
  border: 2px solid rgba(108, 117, 125, 0.3);
  
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Thin Yellow Bottom Accent */
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    right: 25%;
    height: 2px;
    background: linear-gradient(90deg,
      rgba(255, 215, 0, 0) 0%,
      rgba(255, 215, 0, 0.6) 50%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: 0 0 14px 14px;
  }

  &:hover {
    background: linear-gradient(135deg,
      rgba(255, 255, 255, 0.85) 0%,
      rgba(248, 249, 250, 0.75) 100%
    );
    border-color: rgba(108, 117, 125, 0.5);
    transform: translateY(-3px);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

// ==================== ADDITIONAL COMPONENTS ====================

export const CarsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const CarCard = styled.div`
  /* Glassmorphic Car Card */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(250, 251, 252, 0.8) 100%
  );
  backdrop-filter: blur(12px) saturate(150%);
  border-radius: 16px;
  padding: ${({ theme }) => theme.spacing.lg};
  
  /* Thin Orange Border with Yellow Accent */
  border: 2px solid transparent;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.85), rgba(250, 251, 252, 0.8)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.3) 0%,
      rgba(255, 143, 16, 0.5) 50%,
      rgba(192, 192, 192, 0.3) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 12px 32px rgba(255, 143, 16, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .car-image {
    width: 100%;
    height: 180px;
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-radius: 12px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 2px solid rgba(255, 215, 0, 0.4);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.08),
      inset 0 -2px 4px rgba(0, 0, 0, 0.05);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.08);
    }
  }

  .car-title {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  .car-price {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, #FF8F10 0%, #FFAD33 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    filter: drop-shadow(0 1px 2px rgba(255, 143, 16, 0.2));
  }

  .car-details {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 500;
  }

  .car-actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};

    .action-btn {
      flex: 1;
      padding: 10px 16px;
      background: linear-gradient(135deg,
        rgba(255, 143, 16, 0.9) 0%,
        rgba(255, 121, 0, 0.95) 100%
      );
      color: white;
      border: 1px solid rgba(255, 215, 0, 0.5);
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      
      box-shadow: 
        0 4px 12px rgba(255, 143, 16, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg,
          rgba(255, 159, 42, 0.95) 0%,
          rgba(255, 143, 16, 1) 100%
        );
        transform: translateY(-2px);
        box-shadow: 
          0 6px 18px rgba(255, 143, 16, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
`;

// ==================== EMPTY STATE ====================

export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  
  /* Glassmorphic Empty State */
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.6) 0%,
    rgba(250, 251, 252, 0.5) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 2px solid rgba(255, 143, 16, 0.15);
  
  box-shadow: 
    0 6px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);

  .empty-icon {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: block;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .empty-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .empty-description {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    font-weight: 500;
  }
`;

// ==================== PAGE HEADER ====================

export const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  
  /* Premium Glassmorphic Header */
  background: linear-gradient(180deg, 
    rgba(255, 255, 255, 0.85) 0%, 
    rgba(252, 252, 253, 0.75) 50%,
    rgba(255, 255, 255, 0.80) 100%
  );
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: 24px;
  
  /* Metallic Border with Orange-Yellow Gradient */
  border: 3px solid transparent;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.85), rgba(252, 252, 253, 0.75)),
    linear-gradient(135deg,
      rgba(192, 192, 192, 0.5) 0%,
      rgba(255, 143, 16, 0.7) 20%,
      rgba(255, 215, 0, 1) 40%,
      rgba(255, 235, 59, 1) 50%,
      rgba(255, 215, 0, 1) 60%,
      rgba(255, 143, 16, 0.7) 80%,
      rgba(192, 192, 192, 0.5) 100%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  
  /* Premium Layered Shadow System */
  box-shadow: 
    0 2px 0 rgba(255, 255, 255, 0.9) inset,
    0 -2px 0 rgba(0, 0, 0, 0.03) inset,
    0 12px 48px rgba(255, 143, 16, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 215, 0, 0.15);
  
  position: relative;
  overflow: hidden;

  /* Animated Yellow Accent Stripe */
  &::after {
    content: '';
    position: absolute;
    left: 30px;
    right: 30px;
    bottom: 16px;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, 
      rgba(255, 215, 0, 0) 0%, 
      rgba(255, 215, 0, 0.6) 15%,
      rgba(255, 235, 59, 1) 50%, 
      rgba(255, 215, 0, 0.6) 85%, 
      rgba(255, 215, 0, 0) 100%
    );
    box-shadow: 
      0 0 12px rgba(255, 215, 0, 0.8),
      0 0 24px rgba(255, 215, 0, 0.4);
    ${css`animation: ${shimmer} 4s linear infinite;`}
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    background: linear-gradient(135deg, 
      #212529 0%,
      #495057 25%,
      #6c757d 50%,
      #495057 75%,
      #212529 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    ${css`animation: ${gradientShift} 8s ease infinite;`}
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 600px;
    margin: 0 auto;
    font-weight: 500;
  }
`;
