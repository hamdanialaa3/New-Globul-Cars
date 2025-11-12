import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  SELL_WORKFLOW_STEPS,
  SELL_WORKFLOW_STEP_ORDER,
  SellWorkflowStepId
} from '@/constants/sellWorkflowSteps';
import SellWorkflowStepStateService, {
  SellWorkflowStepStatus
} from '@/services/sellWorkflowStepState';

interface SellProgressBarProps {
  currentStep: SellWorkflowStepId;
}

const BarContainer = styled.nav`
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(255, 143, 16, 0.15);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
  overflow: hidden;
`;

const StepsWrapper = styled.ol`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StepButton = styled.button<{
  $status: SellWorkflowStepStatus;
  $active: boolean;
  $clickable: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(248, 250, 252, 0.9);
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  flex-shrink: 0;

  ${({ $status, $active }) => {
    if ($active) {
      return css`
        background: linear-gradient(135deg, rgba(255, 143, 16, 0.16), rgba(0, 92, 169, 0.16));
        border-color: rgba(255, 143, 16, 0.35);
        box-shadow: 0 8px 18px rgba(255, 143, 16, 0.18);
      `;
    }

    if ($status === 'completed') {
      return css`
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.45);
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);
      `;
    }

    return css`
      background: rgba(252, 165, 165, 0.18);
      border-color: rgba(248, 113, 113, 0.5);
    `;
  }}

  ${({ $clickable, $active }) =>
    $clickable &&
    !$active &&
    css`
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(148, 163, 184, 0.25);
      }
    `}
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
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 0.2s ease-in-out;

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

    return css`
      color: #b91c1c;
      background: #fee2e2;
    `;
  }}
`;

const StepLabel = styled.span<{
  $status: SellWorkflowStepStatus;
  $active: boolean;
}>`
  font-size: 0.72rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  letter-spacing: -0.01em;
  transition: color 0.2s ease-in-out;
  color: ${({ $status, $active }) => {
    if ($active) return '#0f172a';
    if ($status === 'completed') return '#0f766e';
    return '#b91c1c';
  }};
`;

const Connector = styled.li<{ $completed: boolean }>`
  width: 38px;
  height: 3px;
  border-radius: 999px;
  flex-shrink: 0;
  background: ${({ $completed }) =>
    $completed ? 'rgba(16, 185, 129, 0.9)' : 'rgba(248, 113, 113, 0.45)'};
  transition: background 0.25s ease-in-out;

  @media (max-width: 1280px) {
    width: 28px;
  }

  @media (max-width: 768px) {
    width: 20px;
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

  const currentIndex = SELL_WORKFLOW_STEP_ORDER.indexOf(currentStep);

  return (
    <BarContainer aria-label="Sell workflow progress">
      <StepsWrapper>
        {SELL_WORKFLOW_STEPS.map((step, index) => {
          const status = statuses[step.id] ?? 'pending';
          const isActive = index === currentIndex;
          const label = language === 'bg' ? step.labels.bg : step.labels.en;

          const isClickable = !isActive;

          const connectorCompleted =
            index > 0 &&
            statuses[SELL_WORKFLOW_STEP_ORDER[index - 1]] === 'completed';

          return (
            <React.Fragment key={step.id}>
              <li>
                <StepButton
                  type="button"
                  $status={status}
                  $active={isActive}
                  $clickable={isClickable}
                  onClick={() => handleStepClick(step.id, isClickable)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-disabled={!isClickable}
                  title={label}
                  disabled={!isClickable}
                >
                  <StepCircle $status={status} $active={isActive}>
                    {index + 1}
                  </StepCircle>
                  <StepLabel $status={status} $active={isActive}>
                    {label}
                  </StepLabel>
                </StepButton>
              </li>
              {index < SELL_WORKFLOW_STEPS.length - 1 && (
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

