import React from 'react';
import styled from 'styled-components';

interface BulkUploadProgressProps {
  progress: number;
  status?: string;
}

export const BulkUploadProgress: React.FC<BulkUploadProgressProps> = ({ progress, status }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <Wrapper>
      <Bar>
        <Fill style={{ width: `${safeProgress}%` }} />
      </Bar>
      <Meta>
        <span>{Math.round(safeProgress)}%</span>
        <span>{status || 'processing'}</span>
      </Meta>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Bar = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
`;

const Fill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transition: width 0.3s ease;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #4b5563;
  font-size: 12px;
`;
