import React from 'react';
import styled from 'styled-components';

const ThemePreviewContainer = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background.default};
  min-height: 100vh;
  font-family: ${props => props.theme.typography.fontFamily};
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ColorCard = styled.div<{ color: string; textColor: string }>`
  background: ${props => props.color};
  color: ${props => props.textColor};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-weight: 600;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StyledButton = styled.button<{ variant: 'primary' | 'secondary' | 'accent' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary.main};
          color: ${props.theme.colors.primary.contrastText};
          &:hover {
            background: ${props.theme.colors.primary.dark};
          }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary.main};
          color: ${props.theme.colors.secondary.contrastText};
          &:hover {
            background: ${props.theme.colors.secondary.dark};
          }
        `;
      case 'accent':
        return `
          background: ${props.theme.colors.accent.main};
          color: ${props.theme.colors.accent.contrastText};
          &:hover {
            background: ${props.theme.colors.accent.dark};
          }
        `;
    }
  }}
`;

const Card = styled.div`
  background: ${props => props.theme.colors.background.paper};
  padding: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
  font-size: 2rem;
`;

const Subtitle = styled.h2`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const Text = styled.p`
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const ThemePreview: React.FC = () => {
  return (
    <ThemePreviewContainer>
      <Title>🎨 معاينة المظهر الحالي</Title>
      <Subtitle>شاهد كيف تبدو الألوان والعناصر في مشروعك</Subtitle>

      <Card>
        <Subtitle>🎯 الألوان الأساسية</Subtitle>
        <ColorGrid>
          <ColorCard
            color="#0059ffff"
            textColor="#000000"
          >
            الأساسي (Primary)
            <br />
            #0022ffff
          </ColorCard>
          <ColorCard
            color="#0040ffff"
            textColor="#000000"
          >
            الثانوي (Secondary)
            <br />
            #2f00ffff
          </ColorCard>
          <ColorCard
            color="#35ffc2ff"
            textColor="#FFFFFF"
          >
            التأكيد (Accent)
            <br />
            #35ff5aff
          </ColorCard>
          <ColorCard
            color="#FFFFFF"
            textColor="#000000"
          >
            الخلفية (Background)
            <br />
            #FFFFFF
          </ColorCard>
        </ColorGrid>
      </Card>

      <Card>
        <Subtitle>🔘 أمثلة على الأزرار</Subtitle>
        <ButtonGrid>
          <StyledButton variant="primary">زر أساسي</StyledButton>
          <StyledButton variant="secondary">زر ثانوي</StyledButton>
          <StyledButton variant="accent">زر تأكيد</StyledButton>
        </ButtonGrid>
      </Card>

      <Card>
        <Subtitle>📝 نموذج تجريبي</Subtitle>
        <Text>هذا النص يستخدم لون النص الأساسي من المظهر</Text>
        <Input type="text" placeholder="حقل إدخال تجريبي" />
        <Input type="email" placeholder="البريد الإلكتروني" />
      </Card>

      <Card>
        <Subtitle>📊 معلومات المظهر</Subtitle>
        <Text>
          <strong>الخط:</strong> {typeof window !== 'undefined' ? getComputedStyle(document.body).fontFamily : 'System Font'}
        </Text>
        <Text>
          <strong>المسافات:</strong> تستخدم نظام المسافات من theme.spacing
        </Text>
        <Text>
          <strong>الحواف الدائرية:</strong> تستخدم theme.borderRadius
        </Text>
      </Card>
    </ThemePreviewContainer>
  );
};

export default ThemePreview;