// CarHistory Component - Placeholder for car history/service records
// مكون تاريخ السيارة

import React from 'react';
import styled from 'styled-components';
import { Clock, FileText, Wrench } from 'lucide-react';

interface CarHistoryProps {
  car: {
    id: string;
    name?: string;
    year?: number;
    [key: string]: any;
  };
}

const HistoryContainer = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const HistoryContent = styled.div`
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #6b7280;
`;

const Message = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

/**
 * CarHistory Component
 * 
 * Displays car service history, maintenance records, and ownership information
 * Currently a placeholder - can be enhanced with actual history data
 * 
 * @param car - Car object with basic information
 */
const CarHistory: React.FC<CarHistoryProps> = ({ car }) => {
  return (
    <HistoryContainer>
      <HistoryTitle>Service History & Records</HistoryTitle>
      <HistoryContent>
        <IconContainer>
          <Clock size={24} />
          <FileText size={24} />
          <Wrench size={24} />
        </IconContainer>
        <Message>
          Service history and maintenance records will be displayed here.
          Contact the seller for detailed information about this vehicle's history.
        </Message>
      </HistoryContent>
    </HistoryContainer>
  );
};

export default CarHistory;
