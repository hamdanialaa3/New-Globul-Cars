// ═══════════════════════════════════════════════════════════════════════════
// 🎨 Design System Showcase - عرض نظام التصميم
// 
// Purpose: Interactive demo of all Design System components
// الهدف: عرض تفاعلي لجميع مكونات نظام التصميم
// 
// Access: /design-system (Development Only)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Card, CardHeader, CardBody, CardFooter } from '@/components/design-system';
import { FiMail, FiLock, FiUser, FiSave, FiTrash2, FiHeart } from 'react-icons/fi';

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 STYLED COMPONENTS - مكونات منمقة
// ═══════════════════════════════════════════════════════════════════════════

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2xl']};
  background: ${({ theme }) => theme.colors.surface.page};
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.content.heading};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.interactive.primary} 0%,
    ${({ theme }) => theme.colors.brand.secondary} 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.content.secondary};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.content.heading};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border.default};
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DemoCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ComponentLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.content.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FlexRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const CodeBlock = styled.pre`
  background: ${({ theme }) => theme.colors.neutral[900]};
  color: ${({ theme }) => theme.colors.neutral[50]};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 DESIGN SYSTEM SHOWCASE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const DesignSystemShowcase: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Title>Design System v2.0</Title>
      <Subtitle>
        Modern, accessible, and human-centric components for Bulgarian Car Marketplace
      </Subtitle>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* BUTTONS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionTitle>🔘 Buttons - الأزرار</SectionTitle>
        
        <ComponentGrid>
          <DemoCard variant="outlined">
            <ComponentLabel>Variants - المتغيرات</ComponentLabel>
            <FlexRow>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </FlexRow>
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Sizes - الأحجام</ComponentLabel>
            <FlexRow>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </FlexRow>
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>With Icons - مع الأيقونات</ComponentLabel>
            <FlexRow>
              <Button iconBefore={<FiSave />}>Save</Button>
              <Button iconAfter={<FiHeart />}>Like</Button>
              <Button variant="danger" iconBefore={<FiTrash2 />}>
                Delete
              </Button>
            </FlexRow>
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>States - الحالات</ComponentLabel>
            <FlexRow>
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
            </FlexRow>
          </DemoCard>
        </ComponentGrid>

        <CodeBlock>{`import { Button } from '@/components/design-system';

<Button variant="primary">Submit</Button>
<Button variant="outline" iconBefore={<FiSave />}>Save</Button>
<Button loading>Processing...</Button>`}</CodeBlock>
      </Section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* INPUTS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionTitle>📝 Inputs - حقول الإدخال</SectionTitle>
        
        <ComponentGrid>
          <DemoCard variant="outlined">
            <ComponentLabel>Basic Input - إدخال أساسي</ComponentLabel>
            <Input 
              label="Email"
              placeholder="your@email.com"
              type="email"
              iconBefore={<FiMail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Password Input - إدخال كلمة المرور</ComponentLabel>
            <Input 
              label="Password"
              placeholder="Enter password"
              type="password"
              iconBefore={<FiLock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be at least 8 characters"
            />
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Required Field - حقل مطلوب</ComponentLabel>
            <Input 
              label="Full Name"
              placeholder="John Doe"
              iconBefore={<FiUser />}
              required
            />
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Error State - حالة الخطأ</ComponentLabel>
            <Input 
              label="Username"
              placeholder="username"
              error="Username is already taken"
            />
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Success State - حالة النجاح</ComponentLabel>
            <Input 
              label="Email"
              placeholder="your@email.com"
              success
              helperText="Email is available!"
            />
          </DemoCard>

          <DemoCard variant="outlined">
            <ComponentLabel>Sizes - الأحجام</ComponentLabel>
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" style={{ marginTop: '8px' }} />
            <Input size="lg" placeholder="Large" style={{ marginTop: '8px' }} />
          </DemoCard>
        </ComponentGrid>

        <CodeBlock>{`import { Input } from '@/components/design-system';

<Input 
  label="Email"
  placeholder="your@email.com"
  iconBefore={<FiMail />}
  required
/>

<Input 
  error="Username is already taken"
/>`}</CodeBlock>
      </Section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CARDS SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionTitle>🎴 Cards - البطاقات</SectionTitle>
        
        <ComponentGrid>
          <Card variant="default">
            <CardHeader>
              <h4>Default Card</h4>
            </CardHeader>
            <CardBody>
              This is a default card with header and body.
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <h4>Elevated Card</h4>
            </CardHeader>
            <CardBody>
              This card has a shadow for elevation effect.
            </CardBody>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <h4>Outlined Card</h4>
            </CardHeader>
            <CardBody>
              This card has a visible border.
            </CardBody>
          </Card>

          <Card variant="filled">
            <CardHeader>
              <h4>Filled Card</h4>
            </CardHeader>
            <CardBody>
              This card has a filled background.
            </CardBody>
          </Card>

          <Card variant="default" hoverable>
            <CardBody>
              <h4>Hoverable Card</h4>
              <p>Hover over me to see the effect!</p>
            </CardBody>
          </Card>

          <Card variant="elevated" clickable onClick={() => alert('Card clicked!')}>
            <CardBody>
              <h4>Clickable Card</h4>
              <p>Click me!</p>
            </CardBody>
          </Card>
        </ComponentGrid>

        <Card variant="outlined" fullWidth>
          <CardHeader>
            <h4>Card with Footer</h4>
          </CardHeader>
          <CardBody>
            This is an example of a card with header, body, and footer sections.
          </CardBody>
          <CardFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save</Button>
          </CardFooter>
        </Card>

        <CodeBlock style={{ marginTop: '24px' }}>{`import { Card, CardHeader, CardBody, CardFooter } from '@/components/design-system';

<Card variant="elevated">
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`}</CodeBlock>
      </Section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* REAL EXAMPLE: LOGIN FORM */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Section>
        <SectionTitle>✨ Real Example - مثال حقيقي</SectionTitle>
        
        <Card variant="elevated" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <CardHeader>
            <h3>تسجيل الدخول / Login</h3>
          </CardHeader>
          <CardBody>
            <Input 
              label="Email"
              type="email"
              placeholder="your@email.com"
              iconBefore={<FiMail />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              style={{ marginBottom: '16px' }}
            />
            
            <Input 
              label="Password"
              type="password"
              placeholder="Enter password"
              iconBefore={<FiLock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              helperText="Must be at least 8 characters"
            />
          </CardBody>
          <CardFooter>
            <Button variant="outline" fullWidth>
              إنشاء حساب / Register
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              loading={isLoading}
              onClick={handleSubmit}
            >
              دخول / Login
            </Button>
          </CardFooter>
        </Card>
      </Section>
    </PageContainer>
  );
};

export default DesignSystemShowcase;
