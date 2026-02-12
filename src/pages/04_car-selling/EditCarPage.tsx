import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../../contexts/LanguageContext';
// import { SellVehicleWizard } from '../../components/SellWorkflow/SellVehicleWizard'; // Replaced by CarEditPage
import CarEditPageInternal from './CarEditPage';
import SmartLoader from '../../components/SmartLoaderCSS';
import { logger } from '../../services/logger-service';

const PageContainer = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EditCarPage: React.FC = () => {
  const params = useParams<{ carId?: string; sellerNumericId?: string; carNumericId?: string }>();
  const navigate = useNavigate();
  // const { language } = useLanguage(); // Handled in internal component
  const [resolvedCarId, setResolvedCarId] = React.useState<string | null>(params.carId || null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // If we already have a carId (legacy route), do nothing
    if (params.carId) return;

    // If we have numeric IDs, resolve them
    const resolveNumericIds = async () => {
      if (!params.sellerNumericId || !params.carNumericId) return;

      setLoading(true);
      try {
        // Dynamic import to avoid circular dependencies
        const { getCarByNumericIds } = await import('../../services/numeric-id-lookup.service');
        const car = await getCarByNumericIds(
          params.sellerNumericId!,
          params.carNumericId!
        );

        if (car && car.id) {
          setResolvedCarId(car.id);
        } else {
          // Handle not found
          navigate('/404');
        }
      } catch (error) {
        logger.error('Failed to resolve car ID', error as Error);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    resolveNumericIds();
  }, [params.carId, params.sellerNumericId, params.carNumericId, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <SmartLoader />
      </PageContainer>
    );
  }

  if (!resolvedCarId) return null;

  // Render the robust Single-Page Edit Form
  return <CarEditPageInternal carId={resolvedCarId} />;
};

export default EditCarPage;
