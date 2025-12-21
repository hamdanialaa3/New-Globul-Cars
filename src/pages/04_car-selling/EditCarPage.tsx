import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
import { SellVehicleWizard } from '../../components/SellWorkflow/SellVehicleWizard';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
`;

const EditCarPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  if (!carId) return null;

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>
            {language === 'bg' ? 'Редактиране на обява' : 'Edit Listing'}
          </Title>
          <Subtitle>
            {language === 'bg' ? 'Променете детайлите на вашата кола' : 'Update your car details'}
          </Subtitle>
        </Header>

        <SellVehicleWizard
          mode="edit"
          existingCarId={carId}
          onComplete={() => navigate(`/car-details/${carId}`)}
          onCancel={() => navigate(-1)}
        />
      </ContentWrapper>
    </PageContainer>
  );
};

export default EditCarPage;
