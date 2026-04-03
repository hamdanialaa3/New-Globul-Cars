import defaultStyled, { css } from 'styled-components';

import type { ProfileType } from '../../../../../types/user/bulgarian-user.types';

import { fadeIn, ledFrame } from './animations';

const styled = defaultStyled;

// ==================== MAIN LAYOUT CONTAINERS ====================

export const ProfilePageContainer = styled.div<{
  $isBusinessMode?: boolean;
  $profileType?: ProfileType;
}>`
  position: relative;
  padding-top: 2rem;
  padding-bottom: 4rem;
  background: var(--bg-primary);
  color: var(--text-primary);

  /* ✅ LED theme variables by profile type */
  ${({ $profileType }) => {
    if ($profileType === 'dealer') {
      return css`
        --led-color: #22c55e;
        --led-glow: rgba(34, 197, 94, 0.35);
      `;
    }
    if ($profileType === 'company') {
      return css`
        --led-color: #3b82f6;
        --led-glow: rgba(59, 130, 246, 0.35);
      `;
    }
    return css`
      --led-color: #ff7a2d;
      --led-glow: rgba(255, 122, 45, 0.35);
    `;
  }}

  html[data-theme="dark"] & {
    background: #0f172a;
    color: #f8fafc;
  }
  animation: ${fadeIn} 0.5s ease-out;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding-top: 0;
    padding-bottom: 80px;
    background: var(--bg-primary);
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding-bottom: 70px;
  }
`;

export const PageContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
  overflow-x: hidden;
  background: transparent;
  color: var(--text-primary);

  html[data-theme='dark'] & {
    background: transparent;
    color: #f8fafc;
  }

  transition:
    background-color 0.3s ease,
    color 0.3s ease;

  @media (max-width: 768px) {
    padding: 0 12px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 0 8px;
  }
`;

export const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;

    > aside {
      display: none;
    }
  }
`;

// ==================== HEADER SECTIONS ====================

export const ProfileHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-primary);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-bottom: 1rem;
    padding-bottom: 0;
    border-bottom: none;
    background: var(--bg-card);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    html[data-theme='dark'] & {
      background: #1e293b;
    }
  }

  @media (max-width: 480px) {
    border-radius: 12px;
    margin-bottom: 0.75rem;
  }
`;

export const ProfileLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const ProfileImageContainer = styled.div`
  position: relative;
  flex-shrink: 0;

  @media (max-width: 768px) {
    margin: -44px auto 16px;
    z-index: 2;
  }

  @media (max-width: 480px) {
    margin-top: -40px;
  }
`;

export const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.primary.main};
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    width: 88px;
    height: 88px;
    border: 4px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }

  @media (max-width: 380px) {
    width: 72px;
    height: 72px;
    border-width: 3px;
  }
`;

export const ProfileInfo = styled.div`
  flex-grow: 1;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;

  @media (max-width: 768px) {
    text-align: center;
    padding: 16px 20px 0;
  }

  @media (max-width: 480px) {
    padding: 12px 16px 0;
  }
`;

export const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 1.375rem;
    font-weight: 700;
    justify-content: center;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }

  @media (max-width: 380px) {
    font-size: 1.125rem;
  }
`;

export const ProfileBio = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 6px auto 0;
    max-width: none;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 480px) {
    font-size: 0.8125rem;
    -webkit-line-clamp: 2;
  }
`;

// ==================== SIDEBAR ====================

export const ProfileSidebar = styled.aside<{
  $isBusinessMode: boolean;
  $themeColor: string;
}>`
  background: ${({ theme }) =>
    theme.colors.background?.paper || theme.colors.background.default};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid
    ${({ theme }) => theme.colors.grey?.[200] || 'rgba(0, 0, 0, 0.1)'};
  align-self: start;
  position: sticky;
  ${ledFrame}
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  html[data-theme='dark'] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ProfileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  position: relative;
  z-index: 1;
  pointer-events: auto;
`;

// ==================== CONTENT SECTIONS ====================

export const ProfileContent = styled.main`
  margin-top: 2rem;

  @media (max-width: 768px) {
    margin-top: 0;
    width: 100%;
  }
`;

export const ContentSection = styled.section<{
  $themeColor?: string;
  $isBusinessMode?: boolean;
}>`
  background: ${({ theme }) =>
    theme.colors.background?.paper || theme.colors.background.default};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid
    ${({ theme }) => theme.colors.grey?.[200] || 'rgba(0, 0, 0, 0.1)'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  ${ledFrame}

  html[data-theme="dark"] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  @media (min-width: 961px) {
    margin-top: 1rem;

    &:first-of-type {
      margin-top: 1rem;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 0;
    margin-bottom: 8px;
    border: none;
    border-top: 1px solid var(--border-primary);
    border-bottom: 1px solid var(--border-primary);
    box-shadow: none;
    margin-top: 140px;

    &:first-of-type {
      border-radius: 0;
      margin-top: 140px;
    }

    &:last-of-type {
      border-radius: 0;
      margin-bottom: 16px;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 6px;
    margin-top: 135px;

    &:first-of-type {
      margin-top: 135px;
    }
  }

  @media (max-width: 380px) {
    margin-top: 130px;

    &:first-of-type {
      margin-top: 130px;
    }
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
    text-shadow:
      0 0 10px rgba(76, 175, 80, 0.6),
      0 0 20px rgba(76, 175, 80, 0.4);
  }

  .edit-btn {
    padding: 8px 16px;
    background: linear-gradient(
      135deg,
      rgb(16, 255, 100) 0%,
      rgb(0, 255, 26) 100%
    );
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 6px rgba(16, 255, 56, 0.3);
    z-index: 1;
    pointer-events: auto;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;

    &:hover {
      background: linear-gradient(
        135deg,
        rgb(42, 255, 42) 0%,
        rgb(26, 255, 102) 100%
      );
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(16, 255, 68, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(16, 255, 64, 0.2);
    }

    svg {
      pointer-events: none;
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-primary);

    h2 {
      font-size: 1.125rem;
      font-weight: 700;
    }

    .edit-btn {
      padding: 6px 12px;
      font-size: 0.8125rem;
      border-radius: 6px;
      min-height: 32px;

      &:active {
        transform: scale(0.95);
      }
    }
  }

  @media (max-width: 480px) {
    h2 {
      font-size: 1rem;
    }

    .edit-btn {
      padding: 6px 10px;
      font-size: 0.75rem;
    }
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
  display: inline-block;

  @media (max-width: 768px) {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent-primary);
    width: 100%;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 10px;
  }
`;

// ==================== COVER & PROFILE IMAGE LAYOUT ====================

export const CoverAndProfileWrapper = styled.div`
  position: relative;
  margin-bottom: -75px;
  z-index: 5;

  @media (min-width: 961px) {
    margin-bottom: 0;
    padding-bottom: 1rem;
  }

  @media (max-width: 960px) {
    margin-bottom: 0 !important;
    padding-bottom: 0;
  }
`;

export const CenteredProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -75px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12))
    drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));

  @media (max-width: 960px) {
    position: relative !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    margin: -60px auto 1rem !important;
    width: fit-content;
    z-index: 0;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));

    &::before,
    &::after {
      display: none;
    }
  }
`;

// ==================== USER INFO BAR LAYOUT ====================

export const UserInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 1.5rem 2rem;
  padding-top: 90px;
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  margin-top: 0;
  margin-bottom: 16px;
  position: relative;
  border: 1px solid var(--border-primary);
  z-index: 0;
  color: var(--text-primary);

  @media (min-width: 961px) {
    margin-top: 1rem;
  }

  html[data-theme='dark'] & {
    background: #1e293b;
    border-color: rgba(255, 255, 255, 0.1);
    color: #f8fafc;
    box-shadow: none;
  }

  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;

  @media (min-width: 961px) {
    margin-top: 1.5rem;
  }

  @media (max-width: 960px) {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem !important;
    padding-top: 1.5rem !important;
    margin-top: 1rem;
    text-align: center;
    z-index: 1;
  }
`;

export const UserInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  color: var(--text-primary);

  html[data-theme='dark'] & {
    color: #f8fafc;
  }

  transition: color 0.3s ease;

  @media (max-width: 960px) {
    align-items: center;
    text-align: center;
    width: 100%;
  }
`;

export const UserInfoCenter = styled.div`
  display: flex;
  gap: 32px;

  html[data-theme='dark'] & {
    color: #f8fafc;
  }

  @media (max-width: 960px) {
    width: 100%;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid var(--border-secondary);
    border-bottom: 1px solid var(--border-secondary);

    html[data-theme='dark'] & {
      border-top-color: rgba(255, 255, 255, 0.1);
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
  }
`;

export const UserInfoRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;

  html[data-theme='dark'] & {
    color: #f8fafc;
  }

  @media (max-width: 960px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
`;

export const UserInfoStatsContainer = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;

  html[data-theme='dark'] & {
    color: #f8fafc;
  }

  @media (max-width: 960px) {
    gap: 16px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

export const UserName = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;

  html[data-theme='dark'] & {
    color: #f8fafc;
  }

  transition: color 0.3s ease;

  @media (max-width: 960px) {
    justify-content: flex-start;
    font-size: 1.5rem;
  }
`;

export const UserEmail = styled.div`
  color: var(--text-secondary);
  font-size: 0.95rem;

  html[data-theme='dark'] & {
    color: #cbd5e1;
  }

  transition: color 0.3s ease;
`;
