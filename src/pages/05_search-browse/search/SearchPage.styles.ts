import styled, { css, keyframes } from 'styled-components';

/* ═══════════════════════════════════════════════════
   SEARCH PAGE — STYLED COMPONENTS
   Inspired by mobile.de search, adapted for Koli One
   ═══════════════════════════════════════════════════ */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`;

/* ─── Page Root ─── */
export const SearchPageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(180deg, #0d1117 0%, #141a24 100%)'
      : '#f1f3f5'};
  padding-bottom: 40px;
`;

/* ─── Two-column shell ─── */
export const SearchLayoutContainer = styled.div`
  max-width: 1380px;
  margin: 0 auto;
  padding: 16px 16px 0;
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 960px) {
    flex-direction: column;
    padding: 12px 12px 0;
  }
`;

/* ═══════════ FILTER SIDEBAR ═══════════ */
export const FilterSidebarContainer = styled.aside<{ $mobileOpen?: boolean }>`
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  animation: ${slideInLeft} 0.35s ease;

  /* Scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#3a4558' : '#c4cdd5'};
    border-radius: 10px;
  }

  @media (max-width: 960px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    min-width: 100%;
    max-height: 100vh;
    height: 100vh;
    z-index: 999;
    padding: 0;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#0d1117' : '#f1f3f5'};
    transform: ${({ $mobileOpen }) =>
      $mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
    top: 0;
    max-height: 100vh;
  }
`;

export const FilterSidebarInner = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #171d2a 0%, #1a2030 100%)'
      : '#ffffff'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#dee2e6')};
  border-radius: 12px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.4)'
      : '0 2px 12px rgba(0,0,0,0.06)'};
  /* overflow:visible so suggestion dropdowns are not clipped */
  overflow: visible;

  @media (max-width: 960px) {
    border-radius: 0;
    border: none;
    box-shadow: none;
    min-height: 100vh;
  }
`;

export const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#e9ecef')};
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(90deg, #1c2333 0%, #212a3a 100%)'
      : 'linear-gradient(90deg, #f8f9fa 0%, #eef1f5 100%)'};
  /* clip the header's gradient background to the parent's top rounded corners */
  border-radius: 12px 12px 0 0;
  overflow: hidden;
`;

export const FilterHeaderTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#f0f4fc' : '#212529'} !important;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

export const FilterResetButton = styled.button`
  background: transparent !important;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#394560' : '#ced4da')} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#8b98b0' : '#6c757d'} !important;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none !important;
  transform: none;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#252d3d' : '#e9ecef'} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#c8d6e5' : '#495057'} !important;
    transform: none;
    box-shadow: none !important;
  }
`;

/* ─── Filter Group ─── */
export const FilterGroupContainer = styled.div`
  border-bottom: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#1e2736' : '#edf0f4')};

  &:last-child {
    border-bottom: none;
  }
`;

export const FilterGroupHeader = styled.button<{ $expanded: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  font-size: 13px;
  font-weight: 600;
  background: transparent !important;
  border: none !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#c8d6e5' : '#343a40'} !important;
  cursor: pointer;
  text-align: left;
  box-shadow: none !important;
  transform: none;
  transition: background 0.15s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#1a2232' : '#f8f9fa'} !important;
    transform: none;
    box-shadow: none !important;
  }
`;

export const FilterGroupChevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  transition: transform 0.25s ease;
  transform: ${({ $expanded }) =>
    $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: ${({ theme }) => (theme.mode === 'dark' ? '#5a6a80' : '#adb5bd')};
  font-size: 12px;
`;

export const FilterGroupBody = styled.div<{ $expanded: boolean }>`
  max-height: ${({ $expanded }) => ($expanded ? '600px' : '0')};
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  padding: ${({ $expanded }) => ($expanded ? '0 18px 14px' : '0 18px')};
`;

/* ─── Inputs inside filters ─── */
export const FilterSelect = styled.select`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 400;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#ced4da')} !important;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#111827' : '#fff'} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#e2e8f0' : '#212529'} !important;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  cursor: pointer;
  transition: border-color 0.2s;
  box-shadow: none !important;

  &:focus {
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12) !important;
  }
`;

export const FilterInput = styled.input`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#ced4da')} !important;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#111827' : '#fff'} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#e2e8f0' : '#212529'} !important;
  box-shadow: none !important;
  transform: none;

  &:focus {
    border-color: var(--accent-primary) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12) !important;
  }

  &:hover {
    transform: none;
    box-shadow: none !important;
  }

  &::placeholder {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#4a5568' : '#999'} !important;
  }
`;

export const FilterRangeRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  & > ${FilterInput}, & > ${FilterSelect} {
    flex: 1;
    min-width: 0;
  }
`;

export const FilterRangeDash = styled.span`
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#4a5568' : '#adb5bd'} !important;
  font-weight: 500;
  flex-shrink: 0;
`;

/* Checkbox row */
export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#c8d6e5' : '#495057'} !important;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#e2e8f0' : '#212529'} !important;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent-primary);
    cursor: pointer;
    flex-shrink: 0;
    background: transparent !important;
    box-shadow: none !important;
    border: 1px solid
      ${({ theme }) => (theme.mode === 'dark' ? '#4a5568' : '#ced4da')} !important;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: none !important;
    }
  }
`;

/* Mobile filter controls */
export const MobileFilterToggle = styled.button`
  display: none;
  @media (max-width: 960px) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 10px;
    border: 1px solid
      ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')} !important;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#171d29' : '#fff'} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#e2e8f0' : '#343a40'} !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transform: none;

    &:hover {
      transform: none;
    }
  }
`;

export const MobileFilterClose = styled.button`
  display: none;
  @media (max-width: 960px) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none !important;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#252d3d' : '#e9ecef'} !important;
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#e2e8f0' : '#495057'} !important;
    font-size: 20px;
    cursor: pointer;
    box-shadow: none !important;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: none !important;
    }
  }
`;

export const MobileOverlay = styled.div<{ $visible: boolean }>`
  display: none;
  @media (max-width: 960px) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
    transition: opacity 0.3s ease;
  }
`;

/* ═══════════ RESULTS AREA ═══════════ */
export const ResultsContainer = styled.div`
  flex: 1;
  min-width: 0;
  animation: ${fadeIn} 0.4s ease;
`;

export const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 18px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #171d2a 0%, #1a2030 100%)'
      : '#ffffff'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#dee2e6')};
  border-radius: 12px;
  margin-bottom: 14px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 4px 24px rgba(0,0,0,0.3)'
      : '0 2px 12px rgba(0,0,0,0.05)'};
`;

export const ResultsCount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#e2e8f0' : '#212529'} !important;

  span {
    color: var(--accent-primary) !important;
    font-weight: 700;
  }
`;

export const ResultsControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const SortSelect = styled.select`
  padding: 7px 32px 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#ced4da')} !important;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#111827' : '#fff'} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#e2e8f0' : '#343a40'} !important;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
  cursor: pointer;
  box-shadow: none !important;
  transform: none;

  &:hover {
    transform: none;
    box-shadow: none !important;
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')};
  border-radius: 8px;
  overflow: hidden;
`;

export const ViewToggleButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 34px;
  border: none !important;
  border-right: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')} !important;
  cursor: pointer;
  font-size: 16px;
  box-shadow: none !important;
  transform: none;
  transition: all 0.15s;

  background: ${({ $active, theme }) =>
    $active
      ? theme.mode === 'dark'
        ? '#1e293b'
        : '#e9ecef'
      : theme.mode === 'dark'
        ? '#111827'
        : '#fff'} !important;
  color: ${({ $active, theme }) =>
    $active
      ? 'var(--accent-primary)'
      : theme.mode === 'dark'
        ? '#5a6a80'
        : '#adb5bd'} !important;

  &:last-child {
    border-right: none !important;
  }

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#1e293b' : '#f1f3f5'} !important;
    transform: none;
    box-shadow: none !important;
  }
`;

/* ─── Result cards ─── */
export const ResultsList = styled.div<{ $viewMode: 'list' | 'grid' }>`
  display: ${({ $viewMode }) => ($viewMode === 'grid' ? 'grid' : 'flex')};
  flex-direction: ${({ $viewMode }) =>
    $viewMode === 'grid' ? 'unset' : 'column'};
  grid-template-columns: ${({ $viewMode }) =>
    $viewMode === 'grid' ? 'repeat(auto-fill, minmax(290px, 1fr))' : 'unset'};
  gap: 14px;
`;

/* ─── List-mode card ─── */
export const ResultCardListWrapper = styled.div`
  display: flex;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #171d2a 0%, #1a2030 100%)'
      : '#ffffff'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#dee2e6')};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 2px 12px rgba(0,0,0,0.3)'
      : '0 1px 6px rgba(0,0,0,0.06)'};
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    transform 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.mode === 'dark'
        ? '0 6px 28px rgba(0,0,0,0.45)'
        : '0 4px 20px rgba(0,0,0,0.1)'};
    border-color: ${({ theme }) =>
      theme.mode === 'dark' ? '#3a4a6a' : '#c4cdd5'};
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const ResultCardImageBox = styled.div`
  width: 300px;
  min-width: 300px;
  height: 200px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#111827' : '#e9ecef')};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  ${ResultCardListWrapper}:hover & img {
    transform: scale(1.04);
  }

  @media (max-width: 640px) {
    width: 100%;
    min-width: 100%;
    height: 200px;
  }
`;

/* ─── Grid-mode card ─── */
export const ResultCardGridWrapper = styled.div`
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(135deg, #171d2a 0%, #1a2030 100%)'
      : '#ffffff'};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#dee2e6')};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 2px 12px rgba(0,0,0,0.3)'
      : '0 1px 6px rgba(0,0,0,0.06)'};
  transition:
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    transform 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.mode === 'dark'
        ? '0 6px 28px rgba(0,0,0,0.45)'
        : '0 4px 20px rgba(0,0,0,0.1)'};
    border-color: ${({ theme }) =>
      theme.mode === 'dark' ? '#3a4a6a' : '#c4cdd5'};
    transform: translateY(-2px);
  }
`;

export const ResultCardGridImageBox = styled.div`
  width: 100%;
  height: 190px;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#111827' : '#e9ecef')};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  ${ResultCardGridWrapper}:hover & img {
    transform: scale(1.04);
  }
`;

/* Shared card content */
export const CardContent = styled.div`
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

export const CardTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#f0f4fc' : '#212529'} !important;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#8b98b0' : '#6c757d'} !important;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardPrice = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#ff9a6c' : '#e8561e'} !important;
  margin-top: 4px;
`;

export const CardMonthlyPrice = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#6b7c96' : '#868e96'} !important;
  margin-left: 6px;
`;

export const CardSpecsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 4px;
`;

export const CardSpec = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#8b98b0' : '#495057'} !important;

  svg {
    width: 14px;
    height: 14px;
    opacity: 0.6;
  }
`;

export const CardLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#5a6a80' : '#868e96'} !important;
  margin-top: auto;
  padding-top: 6px;

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    opacity: 0.5;
  }
`;

export const CardDealerTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#6b7c96' : '#868e96'} !important;
  margin-left: 8px;
`;

/* Badges */
export const BadgeContainer = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 2;
`;

export const Badge = styled.span<{ $variant?: string }>`
  display: inline-flex;
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border-radius: 4px;
  backdrop-filter: blur(6px);

  ${({ $variant }) => {
    switch ($variant) {
      case 'Top Offer':
        return css`
          background: linear-gradient(135deg, #6366f1cc, #e8561ecc);
          color: #fff !important;
        `;
      case 'Like New':
        return css`
          background: linear-gradient(135deg, #10b981cc, #059669cc);
          color: #fff !important;
        `;
      case 'Verified':
        return css`
          background: linear-gradient(135deg, #3b82f6cc, #2563ebcc);
          color: #fff !important;
        `;
      case 'Best Price':
        return css`
          background: linear-gradient(135deg, #f59e0bcc, #d97706cc);
          color: #fff !important;
        `;
      case 'Premium':
        return css`
          background: linear-gradient(135deg, #8b5cf6cc, #7c3aedcc);
          color: #fff !important;
        `;
      case 'Eco':
        return css`
          background: linear-gradient(135deg, #22c55ecc, #16a34acc);
          color: #fff !important;
        `;
      default:
        return css`
          background: rgba(0, 0, 0, 0.65);
          color: #fff !important;
        `;
    }
  }}
`;

/* Favorite button */
export const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  transition:
    transform 0.2s,
    background 0.2s;
  transform: none;

  background: ${({ $active }) =>
    $active ? '#ef4444' : 'rgba(255,255,255,0.9)'} !important;
  color: ${({ $active }) => ($active ? '#fff' : '#6b7280')} !important;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25) !important;
    background: ${({ $active }) =>
      $active ? '#dc2626' : 'rgba(255,255,255,1)'} !important;
  }
`;

/* ═══════════ PAGINATION ═══════════ */
export const PaginationContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 28px 0 10px;
`;

export const PaginationButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none !important;
  transform: none;

  ${({ $active, theme }) =>
    $active
      ? css`
          background: var(--accent-primary) !important;
          border: 1px solid var(--accent-primary) !important;
          color: #fff !important;
        `
      : css`
          background: ${theme.mode === 'dark' ? '#171d2a' : '#fff'} !important;
          border: 1px solid ${theme.mode === 'dark' ? '#2d3748' : '#dee2e6'} !important;
          color: ${theme.mode === 'dark' ? '#c8d6e5' : '#495057'} !important;
        `}

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active
        ? 'var(--accent-dark)'
        : theme.mode === 'dark'
          ? '#1e293b'
          : '#f1f3f5'} !important;
    transform: none;
    box-shadow: none !important;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

/* ═══════════ EMPTY STATES ═══════════ */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
`;

export const EmptyStateTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#c8d6e5' : '#495057'} !important;
  margin: 0 0 8px;
`;

export const EmptyStateText = styled.p`
  font-size: 14px;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#5a6a80' : '#868e96'} !important;
  max-width: 360px;
`;

/* Active filter pills */
export const ActiveFiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 0 12px;
`;

export const ActiveFilterPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')} !important;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#1e293b' : '#f8f9fa'} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#c8d6e5' : '#495057'} !important;
  cursor: pointer;
  box-shadow: none !important;
  transform: none;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#2d3748' : '#e9ecef'} !important;
    transform: none;
    box-shadow: none !important;
  }

  .close-icon {
    font-size: 14px;
    opacity: 0.6;
  }
`;

/* Search bar at top of filters */
export const SearchBarContainer = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#252d3d' : '#e9ecef')};
  position: relative;
  z-index: 10;
`;

export const SearchBarInputWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: ${({ theme }) => (theme.mode === 'dark' ? '#4a5568' : '#adb5bd')};
  }
`;

export const SearchBarInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: 10px;
  font-size: 13px;
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')} !important;
  background: ${({ theme }) =>
    theme.mode === 'dark' ? '#111827' : '#f8f9fa'} !important;
  color: ${({ theme }) =>
    theme.mode === 'dark' ? '#e2e8f0' : '#212529'} !important;
  box-shadow: none !important;
  transform: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--accent-primary) !important;
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#0d1117' : '#fff'} !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
  }

  &:hover {
    transform: none;
    box-shadow: none !important;
  }

  &::placeholder {
    color: ${({ theme }) =>
      theme.mode === 'dark' ? '#4a5568' : '#999'} !important;
  }
`;

/* Filter Apply button (mobile) */
export const FilterApplyButton = styled.button`
  display: none;
  @media (max-width: 960px) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 16px 18px;
    padding: 12px 24px;
    width: calc(100% - 36px);
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    background: var(--accent-primary) !important;
    color: #fff !important;
    border: none !important;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
    transform: none;

    &:hover {
      transform: none;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
    }
  }
`;

/* ─── Autocomplete suggestions dropdown ─── */
export const SuggestionsDropdown = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${({ theme }) => (theme.mode === 'dark' ? '#1a2030' : '#ffffff')};
  border: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#dee2e6')};
  border-radius: 10px;
  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '0 8px 24px rgba(0,0,0,0.5)'
      : '0 8px 24px rgba(0,0,0,0.12)'};
  max-height: 280px;
  overflow-y: auto;
  z-index: 1025;
  margin: 0;
  padding: 4px 0;
  list-style: none;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#3a4558' : '#c4cdd5'};
    border-radius: 10px;
  }
`;

export const SuggestionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13px;
  cursor: pointer;
  color: ${({ theme }) => (theme.mode === 'dark' ? '#e2e8f0' : '#212529')};
  transition: background 0.15s;
  user-select: none;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === 'dark' ? '#212a3a' : '#f0f2f5'};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

/* Loading skeleton */
const shimmer = keyframes`
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

export const SkeletonCard = styled.div`
  height: 200px;
  border-radius: 12px;
  background: ${({ theme }) =>
    theme.mode === 'dark'
      ? 'linear-gradient(90deg, #171d2a 25%, #1e263a 50%, #171d2a 75%)'
      : 'linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%)'};
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;
