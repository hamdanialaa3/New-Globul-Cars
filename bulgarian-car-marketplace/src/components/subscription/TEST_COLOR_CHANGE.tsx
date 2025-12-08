/**
 * 🧪 ملف اختبار - للتأكد من أن تغيير الألوان يعمل
 * 
 * إذا رأيت هذا الملف في المتصفح، فالنظام يعمل!
 */

import React from 'react';
import styled from 'styled-components';
import subscriptionTheme from './subscription-theme';

const TestBox = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 200px;
  height: 100px;
  background: ${subscriptionTheme.primary.gradient};
  color: white;
  padding: 1rem;
  border-radius: 10px;
  z-index: 9999;
  box-shadow: 0 4px 20px ${subscriptionTheme.shadows.medium};
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TestColorChange: React.FC = () => {
  return (
    <TestBox>
      <div>
        <div>✅ النظام يعمل!</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          اللون: {subscriptionTheme.primary.main}
        </div>
      </div>
    </TestBox>
  );
};

export default TestColorChange;

