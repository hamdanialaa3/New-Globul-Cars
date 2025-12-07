import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { SELL_WORKFLOW_STEP_GROUPS, SellWorkflowStepId } from '../../constants/sellWorkflowSteps';
import SellWorkflowStepStateService, {
  SellWorkflowStepStatus
} from '../../services/sellWorkflowStepState';

interface SellProgressBarProps {
  currentStep: SellWorkflowStepId;
}

const BarContainer = styled.nav`
  position: relative;
  /* ✅ FIX: Dynamic background for light/dark mode */
  background: var(--bg-card, #ffffff);
  border-radius: 22px;
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  padding: 0.9rem 1.25rem;
  overflow: hidden;
  box-shadow:
    0 25px 40px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  /* Dark mode styles */
  [data-theme="dark"] &,
  .dark-theme & {
    background: linear-gradient(135deg, rgba(13, 17, 28, 0.9), rgba(15, 23, 42, 0.95));
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow:
      0 25px 40px rgba(2, 6, 23, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 16px;
    border: 1px solid var(--border, rgba(0, 0, 0, 0.05));
    pointer-events: none;
    box-shadow: inset 0 0 45px rgba(255, 143, 16, 0.03);
    transition: all 0.3s ease;
  }

  /* Dark mode ::after */
  [data-theme="dark"] &::after,
  .dark-theme &::after {
    border-color: rgba(255, 255, 255, 0.04);
    box-shadow: inset 0 0 45px rgba(255, 143, 16, 0.06);
  }
`;

const StepsWrapper = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const StepButton = styled.button<{
  $status: SellWorkflowStepStatus;
  $active: boolean;
  $clickable: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.95rem;
  border-radius: 16px;
  /* ✅ FIX: Light mode default */
  border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
  background: var(--bg-secondary, #f8f9fa);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  min-width: 135px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent);
    opacity: 0.3;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  /* Dark mode ::before */
  [data-theme="dark"] &::before,
  .dark-theme &::before {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent);
    opacity: 0.55;
  }

  &::after {
    content: '';
    position: absolute;
    inset: -30%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 0, 0, 0.05), transparent 70%);
    opacity: 0.2;
    pointer-events: none;
    mix-blend-mode: multiply;
    transition: all 0.3s ease;
  }

  /* Dark mode ::after */
  [data-theme="dark"] &::after,
  .dark-theme &::after {
    background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 70%);
    opacity: 0.35;
    mix-blend-mode: screen;
  }

  ${({ $status, $active }) => {
    if ($active) {
      return css`
        background: linear-gradient(135deg, rgba(255, 143, 16, 0.4), rgba(14, 165, 233, 0.45));
        border-color: rgba(255, 143, 16, 0.5);
        box-shadow:
          0 18px 35px rgba(255, 143, 16, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
      `;
    }

    if ($status === 'completed') {
      return css`
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.6));
        border-color: rgba(16, 185, 129, 0.45);
        box-shadow:
          0 14px 28px rgba(16, 185, 129, 0.32),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      `;
    }

    return css`
      background: var(--bg-secondary, #f8f9fa);
      border-color: var(--border, rgba(0, 0, 0, 0.1));
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
    `;
  }}

  /* Dark mode default state */
  [data-theme="dark"] &,
  .dark-theme & {
    ${({ $status, $active }) => {
      if (!$active && $status !== 'completed') {
        return css`
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.9));
          border-color: rgba(148, 163, 184, 0.4);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        `;
      }
      return '';
    }}
  }

  ${({ $clickable, $active }) =>
    $clickable &&
    !$active &&
    css`
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(148, 163, 184, 0.25);
        background: var(--bg-hover, #e9ecef);
      }
    `}

  /* Dark mode hover */
  [data-theme="dark"] &,
  .dark-theme & {
    ${({ $clickable, $active }) =>
      $clickable &&
      !$active &&
      css`
        &:hover {
          box-shadow: 0 14px 28px rgba(148, 163, 184, 0.35);
        }
      `}
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    padding: 0.65rem 0.9rem;
  }
`;

const StepCircle = styled.span<{
  $status: SellWorkflowStepStatus;
  $active: boolean;
}>`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s ease-in-out;
  position: relative;

  ${({ $status, $active }) => {
    if ($active) {
      return css`
        color: #ffffff;
        background: linear-gradient(135deg, #ff8f10, #005ca9);
        box-shadow: 0 6px 16px rgba(255, 143, 16, 0.35);
      `;
    }

    if ($status === 'completed') {
      return css`
        color: #065f46;
        background: #bbf7d0;
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.25);
      `;
    }

    /* ✅ FIX: Light mode pending */
    return css`
      color: #64748b;
      background: #e2e8f0;
    `;
  }}

  /* Dark mode pending state */
  [data-theme="dark"] &,
  .dark-theme & {
    ${({ $status, $active }) => {
      if (!$active && $status !== 'completed') {
        return css`
          color: #b91c1c;
          background: #fee2e2;
        `;
      }
      return '';
    }}
  }
`;

const StepLabel = styled.span<{
  $status: SellWorkflowStepStatus;
  $active: boolean;
}>`
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  letter-spacing: -0.01em;
  transition: color 0.2s ease-in-out;
  /* ✅ FIX: Light mode colors */
  color: ${({ $status, $active }) => {
    if ($active) return '#1e293b';
    if ($status === 'completed') return '#065f46';
    return '#64748b';
  }};

  /* Dark mode colors */
  [data-theme="dark"] &,
  .dark-theme & {
    color: ${({ $status, $active }) => {
      if ($active) return '#f1f5f9';
      if ($status === 'completed') return '#d1fae5';
      return '#e2e8f0';
    }};
  }
`;

const StepCaption = styled.span`
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  /* ✅ FIX: Light mode color */
  color: rgba(100, 116, 139, 0.7);
  transition: color 0.2s ease-in-out;

  /* Dark mode color */
  [data-theme="dark"] &,
  .dark-theme & {
    color: rgba(248, 250, 252, 0.55);
  }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Connector = styled.li<{ $completed: boolean }>`
  width: 40px;
  height: 4px;
  border-radius: 999px;
  flex-shrink: 0;
  /* ✅ FIX: Light mode colors */
  background: ${({ $completed }) =>
    $completed
      ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.95), rgba(45, 212, 191, 0.85))'
      : 'linear-gradient(90deg, rgba(203, 213, 225, 0.6), rgba(226, 232, 240, 0.4))'};
  transition: all 0.25s ease-in-out;
  box-shadow: ${({ $completed }) =>
    $completed
      ? '0 8px 16px rgba(16, 185, 129, 0.35)'
      : 'inset 0 0 6px rgba(0, 0, 0, 0.05)'};

  /* Dark mode colors */
  [data-theme="dark"] &,
  .dark-theme & {
    background: ${({ $completed }) =>
      $completed
        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.95), rgba(45, 212, 191, 0.85))'
        : 'linear-gradient(90deg, rgba(71, 85, 105, 0.65), rgba(51, 65, 85, 0.4))'};
    box-shadow: ${({ $completed }) =>
      $completed
        ? '0 8px 16px rgba(16, 185, 129, 0.35)'
        : 'inset 0 0 6px rgba(15, 23, 42, 0.65)'};
  }

  @media (max-width: 1280px) {
    width: 28px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const STEP_ROUTE_BUILDERS: Record<
  SellWorkflowStepId,
  (vehicleType: string, search: string) => string
> = {
  'vehicle-selection': (_vehicleType, search) => `/sell/auto${search}`,
  'vehicle-data': (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/fahrzeugdaten/antrieb-und-umwelt${search}`,
  equipment: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/equipment${search}`,
  images: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/details/bilder${search}`,
  pricing: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/details/preis${search}`,
  contact: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/contact${search}`,
  preview: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/preview${search}`,
  publish: (vehicleType, search) =>
    `/sell/inserat/${vehicleType}/submission${search}`
};

const SellProgressBar: React.FC<SellProgressBarProps> = ({ currentStep }) => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState(
    SellWorkflowStepStateService.getStatuses()
  );

  useEffect(() => {
    const unsubscribe = SellWorkflowStepStateService.subscribe(setStatuses);
    return () => unsubscribe();
  }, []);

  const search = location.search || '';

  const vehicleType = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments[0] === 'sell' && segments[1] === 'inserat' && segments[2]) {
      return segments[2];
    }

    const params = new URLSearchParams(search);
    return params.get('vt') || 'car';
  }, [location.pathname, search]);

  const handleStepClick = useCallback(
    (stepId: SellWorkflowStepId, isClickable: boolean) => {
      if (!isClickable) return;

      const builder = STEP_ROUTE_BUILDERS[stepId];
      if (!builder) return;

      navigate(builder(vehicleType, search));
    },
    [navigate, vehicleType, search]
  );

  const stepGroups = useMemo(() => {
    return SELL_WORKFLOW_STEP_GROUPS.map((group, index) => {
      const groupStepStatuses = group.steps.map(stepId => statuses[stepId] ?? 'pending');
      const isActive = group.steps.includes(currentStep);
      const isCompleted = groupStepStatuses.every(status => status === 'completed');
      const nextTargetStep =
        group.steps.find(stepId => statuses[stepId] !== 'completed') ?? group.steps[0];
      return {
        group,
        index,
        isActive,
        isCompleted,
        targetStep: nextTargetStep
      };
    });
  }, [statuses, currentStep]);

  const prefix = language === 'bg' ? 'Етап' : 'Stage';

  return (
    <BarContainer aria-label="Sell workflow progress">
      <StepsWrapper>
        {stepGroups.map(({ group, index, isActive, isCompleted, targetStep }) => {
          const label = language === 'bg' ? group.labels.bg : group.labels.en;
          const isClickable = !isActive;
          const connectorCompleted = stepGroups[index].isCompleted;
          const statusForStyles: SellWorkflowStepStatus = isCompleted ? 'completed' : 'pending';

          return (
            <React.Fragment key={group.id}>
              <li>
                <StepButton
                  type="button"
                  $status={statusForStyles}
                  $active={isActive}
                  $clickable={isClickable}
                  onClick={() => handleStepClick(targetStep, isClickable)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={!isClickable}
                  title={label}
                  disabled={!isClickable}
                >
                  <StepCircle $status={statusForStyles} $active={isActive}>
                    {index + 1}
                  </StepCircle>
                  <StepContent>
                    <StepCaption>
                      {prefix} {index + 1}
                    </StepCaption>
                    <StepLabel $status={statusForStyles} $active={isActive}>
                      {label}
                    </StepLabel>
                  </StepContent>
                </StepButton>
              </li>
              {index < stepGroups.length - 1 && (
                <Connector $completed={connectorCompleted} />
              )}
            </React.Fragment>
          );
        })}
      </StepsWrapper>
    </BarContainer>
  );
};

export default SellProgressBar;

