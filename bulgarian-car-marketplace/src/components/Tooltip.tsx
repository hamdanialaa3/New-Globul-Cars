// Tooltip Component - Helpful tooltips for form fields
// مكون التلميحات - تلميحات مفيدة لحقول النماذج

import React, { useState } from 'react';
import styled from 'styled-components';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const TooltipTrigger = styled.div`
  display: inline-flex;
  cursor: help;
  color: #94a3b8;
  transition: color 0.2s;

  &:hover {
    color: #ff8f10;
  }
`;

const TooltipBox = styled.div<{ $position: string; $isVisible: boolean }>`
  position: absolute;
  ${props => {
    switch (props.$position) {
      case 'top':
        return `
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'bottom':
        return `
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        `;
      case 'left':
        return `
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        `;
      case 'right':
        return `
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
        `;
      default:
        return `
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
        `;
    }
  }}
  
  background: #1e293b;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.813rem;
  line-height: 1.5;
  white-space: nowrap;
  max-width: 280px;
  z-index: 1000;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.2s, visibility 0.2s;

  &::before {
    content: '';
    position: absolute;
    ${props => {
      switch (props.$position) {
        case 'top':
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #1e293b;
          `;
        case 'bottom':
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 6px solid #1e293b;
          `;
        case 'left':
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-left: 6px solid #1e293b;
          `;
        case 'right':
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-top: 6px solid transparent;
            border-bottom: 6px solid transparent;
            border-right: 6px solid #1e293b;
          `;
        default:
          return '';
      }
    }}
  }

  @media (max-width: 768px) {
    white-space: normal;
    max-width: 220px;
  }
`;

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipContainer
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <TooltipTrigger>
        {children || <HelpCircle size={16} />}
      </TooltipTrigger>
      
      <TooltipBox $position={position} $isVisible={isVisible}>
        {content}
      </TooltipBox>
    </TooltipContainer>
  );
};

export default Tooltip;

// Common tooltips for car selling workflow
export const CarSellingTooltips = {
  bg: {
    make: 'Марката на автомобила. Например: BMW, Mercedes-Benz, Audi',
    model: 'Моделът на автомобила. Например: X5, E-Class, A4',
    year: 'Година на производство. Проверете в техническия паспорт или сертификата за регистрация',
    mileage: 'Общият пробег в километри. Проверете на километража на автомобила',
    fuelType: 'Типът гориво, което автомобилът използва',
    transmission: 'Типът на скоростната кутия - ръчна или автоматична',
    power: 'Мощността на двигателя в конски сили (к.с.) или киловати (kW)',
    doors: 'Броят на вратите, включително задната врата/багажник',
    seats: 'Максималният брой места за сядане',
    color: 'Външният цвят на автомобила',
    price: 'Желаната продажна цена в евро (EUR)',
    negotiable: 'Може ли цената да се обсъжда с купувачи',
    region: 'Областта в България, където се намира автомобилът',
    city: 'Градът в България, където се намира автомобилът',
    phone: 'Вашият телефонен номер във формат +359...',
    images: 'Качете поне 5 снимки от различни ъгли за по-добра видимост'
  },
  en: {
    make: 'The car manufacturer. Example: BMW, Mercedes-Benz, Audi',
    model: 'The car model. Example: X5, E-Class, A4',
    year: 'Year of manufacture. Check your vehicle registration document',
    mileage: 'Total distance traveled in kilometers. Check the odometer',
    fuelType: 'The type of fuel the vehicle uses',
    transmission: 'Type of gearbox - manual or automatic',
    power: 'Engine power in horsepower (HP) or kilowatts (kW)',
    doors: 'Number of doors including rear door/trunk',
    seats: 'Maximum number of seats',
    color: 'Exterior color of the vehicle',
    price: 'Your desired selling price in euros (EUR)',
    negotiable: 'Whether the price can be negotiated with buyers',
    region: 'The region in Bulgaria where the vehicle is located',
    city: 'The city in Bulgaria where the vehicle is located',
    phone: 'Your phone number in format +359...',
    images: 'Upload at least 5 photos from different angles for better visibility'
  }
};

