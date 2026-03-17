/**
 * Advisor Wizard Component
 * 
 * Handles the step-by-step questionnaire for the AI Advisor.
 * Steps:
 * 1. Usage (Lifestyle)
 * 2. Budget
 * 3. Preferences (Fuel, transmission)
 * 4. Priorities
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Users, Mountain, Zap, Star,
    ArrowRight, ArrowLeft, Check, DollarSign,
    Fuel, Settings, Shield, Activity, Leaf
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface WizardProps {
    onComplete: (data: AdvisorData) => void;
}

export interface AdvisorData {
    usage: string;
    budget: number;
    fuelType: string[];
    transmission: string;
    priorities: string[];
}

const steps = [
    { id: 'usage', title: 'Main Usage' },
    { id: 'budget', title: 'Budget' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'priorities', title: 'Priorities' }
];

const WizardContainer = styled.div<{ $isDark: boolean }>`
  max-width: 800px;
  margin: 0 auto;
  background: ${props => props.$isDark ? '#1e293b' : 'white'};
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.$isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(148, 163, 184, 0.2);
    z-index: 0;
    transform: translateY(-50%);
  }
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$active || props.$completed ? '#3b82f6' : '#e2e8f0'};
  color: ${props => props.$active || props.$completed ? 'white' : '#64748b'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  z-index: 1;
  position: relative;
  transition: all 0.3s ease;
  border: 4px solid ${props => props.$active ? (props.theme.mode === 'dark' ? '#1e293b' : 'white') : 'transparent'};
  box-shadow: ${props => props.$active ? '0 0 0 2px #3b82f6' : 'none'};
`;

const StepTitle = styled.h2<{ $isDark: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OptionCard = styled(motion.div) <{ $selected: boolean; $isDark: boolean }>`
  background: ${props => props.$selected
        ? (props.$isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff')
        : (props.$isDark ? '#0f172a' : '#f8fafc')};
  border: 2px solid ${props => props.$selected ? '#3b82f6' : 'transparent'};
  padding: 1.5rem;
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${props => props.$selected ? '#3b82f6' : '#cbd5e1'};
  }
`;

const IconWrapper = styled.div<{ $selected: boolean }>`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.$selected ? '#3b82f6' : '#64748b'};
`;

const OptionLabel = styled.h3<{ $isDark: boolean }>`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.$isDark ? '#f8fafc' : '#1e293b'};
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  background: ${props => props.$primary
        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#64748b'};
  transition: all 0.2s ease;

  &:hover {
    transform: ${props => props.$primary ? 'translateY(-2px)' : 'none'};
    color: ${props => props.$primary ? 'white' : '#3b82f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RangeContainer = styled.div`
  padding: 2rem 0;
  text-align: center;
`;

const BudgetDisplay = styled.div<{ $isDark: boolean }>`
  font-size: 3rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 1rem;
`;

const RangeInput = styled.input`
  width: 100%;
  max-width: 500px;
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  outline: none;
  appearance: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const AdvisorWizard: React.FC<WizardProps> = ({ onComplete }) => {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const isDark = theme === 'dark';
    const isBg = language === 'bg';

    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<AdvisorData>({
        usage: '',
        budget: 20000,
        fuelType: [],
        transmission: '',
        priorities: []
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const updateData = (key: keyof AdvisorData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const toggleArrayItem = (key: keyof AdvisorData, value: string) => {
        setData(prev => {
            const current = prev[key] as string[];
            const exists = current.includes(value);
            return {
                ...prev,
                [key]: exists
                    ? current.filter(item => item !== value)
                    : [...current, value]
            };
        });
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: // Usage
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <StepTitle $isDark={isDark}>{isBg ? 'За какво ще използвате автомобила?' : 'What will you use the car for?'}</StepTitle>
                        <OptionsGrid>
                            {usageOptions.map(opt => (
                                <OptionCard
                                    key={opt.id}
                                    $isDark={isDark}
                                    $selected={data.usage === opt.id}
                                    onClick={() => updateData('usage', opt.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <IconWrapper $selected={data.usage === opt.id}>{opt.icon}</IconWrapper>
                                    <OptionLabel $isDark={isDark}>{isBg ? opt.labelBg : opt.labelEn}</OptionLabel>
                                </OptionCard>
                            ))}
                        </OptionsGrid>
                    </motion.div>
                );

            case 1: // Budget
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <StepTitle $isDark={isDark}>{isBg ? 'Какъв е вашият бюджет?' : 'What is your budget?'}</StepTitle>
                        <RangeContainer>
                            <BudgetDisplay $isDark={isDark}>
                                {data.budget.toLocaleString()} {isBg ? 'лв.' : 'BGN'}
                            </BudgetDisplay>
                            <RangeInput
                                type="range"
                                min="2000"
                                max="200000"
                                step="1000"
                                value={data.budget}
                                onChange={(e) => updateData('budget', parseInt(e.target.value))}
                            />
                            <p style={{ marginTop: '1rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                {isBg ? 'Плъзнете за да промените' : 'Slide to adjust'}
                            </p>
                        </RangeContainer>
                    </motion.div>
                );

            case 2: // Preferences
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <StepTitle $isDark={isDark}>{isBg ? 'Предпочитания' : 'Preferences'}</StepTitle>

                        <h3 style={{ color: isDark ? 'white' : 'black', marginBottom: '1rem' }}>{isBg ? 'Скоростна кутия' : 'Transmission'}</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            {['Automatic', 'Manual'].map(type => (
                                <OptionCard
                                    key={type}
                                    $isDark={isDark}
                                    $selected={data.transmission === type}
                                    onClick={() => updateData('transmission', type)}
                                    style={{ flex: 1 }}
                                >
                                    <OptionLabel $isDark={isDark}>{type === 'Automatic' ? (isBg ? 'Автоматик' : 'Automatic') : (isBg ? 'Ръчна' : 'Manual')}</OptionLabel>
                                </OptionCard>
                            ))}
                        </div>

                        <h3 style={{ color: isDark ? 'white' : 'black', marginBottom: '1rem' }}>{isBg ? 'Гориво' : 'Fuel Type'}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map(fuel => (
                                <OptionCard
                                    key={fuel}
                                    $isDark={isDark}
                                    $selected={(data.fuelType as string[]).includes(fuel)}
                                    onClick={() => toggleArrayItem('fuelType', fuel)}
                                    style={{ padding: '1rem' }}
                                >
                                    <OptionLabel $isDark={isDark}>{fuel}</OptionLabel>
                                </OptionCard>
                            ))}
                        </div>
                    </motion.div>
                );

            case 3: // Priorities
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <StepTitle $isDark={isDark}>{isBg ? 'Какво е най-важно за вас?' : 'What matters most to you?'}</StepTitle>
                        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#64748b' }}>
                            {isBg ? 'Изберете до 3 приоритета' : 'Select up to 3 priorities'}
                        </p>
                        <OptionsGrid>
                            {priorityOptions.map(opt => (
                                <OptionCard
                                    key={opt.id}
                                    $isDark={isDark}
                                    $selected={(data.priorities as string[]).includes(opt.id)}
                                    onClick={() => {
                                        const current = data.priorities as string[];
                                        if (current.includes(opt.id)) {
                                            toggleArrayItem('priorities', opt.id);
                                        } else if (current.length < 3) {
                                            toggleArrayItem('priorities', opt.id);
                                        }
                                    }}
                                >
                                    <IconWrapper $selected={(data.priorities as string[]).includes(opt.id)}>{opt.icon}</IconWrapper>
                                    <OptionLabel $isDark={isDark}>{isBg ? opt.labelBg : opt.labelEn}</OptionLabel>
                                </OptionCard>
                            ))}
                        </OptionsGrid>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <WizardContainer $isDark={isDark}>
            <StepIndicator>
                {steps.map((s, idx) => (
                    <StepDot
                        key={s.id}
                        $active={idx === currentStep}
                        $completed={idx < currentStep}
                        theme={{ mode: theme }}
                    >
                        {idx < currentStep ? <Check size={20} /> : idx + 1}
                    </StepDot>
                ))}
            </StepIndicator>

            <div style={{ minHeight: '400px' }}>
                {renderStep()}
            </div>

            <Navigation>
                <Button onClick={handleBack} disabled={currentStep === 0}>
                    <ArrowLeft size={18} /> {isBg ? 'Назад' : 'Back'}
                </Button>
                <Button $primary onClick={handleNext} disabled={!canProceed(currentStep, data)}>
                    {currentStep === steps.length - 1 ? (isBg ? 'Покажи Резултати' : 'Show Results') : (isBg ? 'Напред' : 'Next')}
                    {currentStep !== steps.length - 1 && <ArrowRight size={18} />}
                </Button>
            </Navigation>
        </WizardContainer>
    );
};

// Helpers
const canProceed = (step: number, data: AdvisorData) => {
    if (step === 0 && !data.usage) return false;
    if (step === 2 && !data.transmission) return false;
    // if (step === 3 && data.priorities.length === 0) return false;
    return true;
};

const usageOptions = [
    { id: 'commute', labelEn: 'Daily Commute', labelBg: 'Ежедневно', icon: <Briefcase /> },
    { id: 'family', labelEn: 'Family', labelBg: 'Семейство', icon: <Users /> },
    { id: 'adventure', labelEn: 'Off-Road / Adventure', labelBg: 'Приключения', icon: <Mountain /> },
    { id: 'city', labelEn: 'City Driving', labelBg: 'Градско', icon: <Settings /> },
    { id: 'performance', labelEn: 'Sport & Fun', labelBg: 'Спорт и Забавление', icon: <Zap /> },
    { id: 'luxury', labelEn: 'Status & Luxury', labelBg: 'Лукс и Статус', icon: <Star /> },
];

const priorityOptions = [
    { id: 'economy', labelEn: 'Fuel Economy', labelBg: 'Икономичност', icon: <Leaf /> },
    { id: 'reliability', labelEn: 'Reliability', labelBg: 'Надеждност', icon: <Shield /> },
    { id: 'performance', labelEn: 'Performance', labelBg: 'Мощност', icon: <Activity /> },
    { id: 'safety', labelEn: 'Safety', labelBg: 'Сигурност', icon: <Shield /> },
    { id: 'comfort', labelEn: 'Comfort', labelBg: 'Комфорт', icon: <Star /> },
    { id: 'technology', labelEn: 'Technology', labelBg: 'Технологии', icon: <Zap /> },
];

export default AdvisorWizard;
