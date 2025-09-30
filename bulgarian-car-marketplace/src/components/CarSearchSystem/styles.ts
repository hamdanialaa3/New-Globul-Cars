// CarSearchSystem/styles.ts
// التصميم المرئي لنظام البحث في السيارات

import styled from 'styled-components';

export const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

export const SearchGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;

  @media (max-width: 768px) {
    min-width: 150px;
    flex: 1 1 100%;
  }

  @media (max-width: 480px) {
    min-width: 120px;
  }
`;

export const SearchLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 2px;
  }
`;

export const SearchSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
  }

  @media (max-width: 480px) {
    padding: 6px 8px;
    font-size: 14px;
  }

  option {
    padding: 8px;
  }
`;

export const SearchButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.2);
  }
`;