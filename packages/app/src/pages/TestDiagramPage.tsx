// Test Diagram Page - صفحة اختبار المخطط
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  text-align: center;
  padding: 20px;
`;

const TestDiagramPage: React.FC = () => {
  return (
    <Container>
      <div>
        <h1>✅ Test Diagram Page Works!</h1>
        <p>إذا رأيت هذا، Route يعمل بشكل صحيح</p>
        <p>If you see this, Route is working correctly</p>
      </div>
    </Container>
  );
};

export default TestDiagramPage;

