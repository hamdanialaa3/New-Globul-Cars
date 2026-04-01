import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { isFeatureEnabled } from '@/config/feature-flags';
import {
  crossBorderEscrowService,
  EscrowTransaction,
  ImportCountry,
} from '@/services/escrow/cross-border-escrow.service';
import { serviceLogger } from '@/services/logger-service';

const COUNTRIES: ImportCountry[] = ['DE', 'IT', 'FR', 'NL', 'BE', 'AT', 'ES', 'CZ', 'PL', 'RO', 'HU'];

const CrossBorderEscrowPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Feature flag gate: Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_CROSS_BORDER_ESCROW')) {
      navigate('/search');
    }
  }, [navigate]);

  // Early return while feature flag is false
  if (!isFeatureEnabled('ENABLE_CROSS_BORDER_ESCROW')) {
    return null;
  }

  const [carPrice, setCarPrice] = useState(16500);
  const [originCountry, setOriginCountry] = useState<ImportCountry>('DE');
  const [originCity, setOriginCity] = useState('Munich');
  const [destinationCity, setDestinationCity] = useState('Sofia');
  const [engineType, setEngineType] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid'>('diesel');
  const [engineCc, setEngineCc] = useState(2000);
  const [yearOfManufacture, setYearOfManufacture] = useState(2019);
  const [vin, setVin] = useState('WBA5A7C57GG123456');
  const [sellerId, setSellerId] = useState('seller_demo');
  const [carId, setCarId] = useState('car_demo_001');

  const [transaction, setTransaction] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(false);

  const cost = useMemo(() => {
    return crossBorderEscrowService.calculateImportCost({
      carPrice,
      originCountry,
      destinationCity,
      vehicleType: 'car',
      engineType,
      engineCc,
      yearOfManufacture,
    });
  }, [carPrice, originCountry, destinationCity, engineType, engineCc, yearOfManufacture]);

  const initiate = async () => {
    if (!user?.uid) {
      toast.error('Please sign in first to create escrow.');
      return;
    }

    setLoading(true);
    try {
      const tx = await crossBorderEscrowService.initiateEscrow({
        buyerId: user.uid,
        sellerId,
        carId,
        vin,
        carPrice,
        originCountry,
        originCity,
        destinationCity,
        transportMethod: 'truck',
        engineType,
        engineCc,
        yearOfManufacture,
      });
      setTransaction(tx);
      toast.success('Escrow transaction created successfully.');
    } catch (error) {
      serviceLogger.error('Escrow page: initiate failed', error as Error);
      toast.error('Could not create escrow transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Helmet>
        <title>Cross-Border Escrow Import | Koli One</title>
      </Helmet>

      <Header>
        <h1>Cross-Border Escrow Import</h1>
        <p>Calculate landed cost and start protected EU-to-Bulgaria vehicle import.</p>
      </Header>

      <Grid>
        <Card>
          <h2>Import Configuration</h2>

          <Row>
            <label>Car Price (EUR)</label>
            <input type="number" value={carPrice} onChange={e => setCarPrice(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Origin Country</label>
            <select value={originCountry} onChange={e => setOriginCountry(e.target.value as ImportCountry)}>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Row>

          <Row>
            <label>Origin City</label>
            <input value={originCity} onChange={e => setOriginCity(e.target.value)} />
          </Row>

          <Row>
            <label>Destination City</label>
            <input value={destinationCity} onChange={e => setDestinationCity(e.target.value)} />
          </Row>

          <Row>
            <label>Engine Type</label>
            <select value={engineType} onChange={e => setEngineType(e.target.value as 'petrol' | 'diesel' | 'electric' | 'hybrid')}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Row>

          <TwoCol>
            <Row>
              <label>Engine CC</label>
              <input type="number" value={engineCc} onChange={e => setEngineCc(Number(e.target.value))} />
            </Row>
            <Row>
              <label>Manufacture Year</label>
              <input type="number" value={yearOfManufacture} onChange={e => setYearOfManufacture(Number(e.target.value))} />
            </Row>
          </TwoCol>

          <h3>Escrow Metadata</h3>

          <Row>
            <label>VIN</label>
            <input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} />
          </Row>

          <Row>
            <label>Car ID</label>
            <input value={carId} onChange={e => setCarId(e.target.value)} />
          </Row>

          <Row>
            <label>Seller ID</label>
            <input value={sellerId} onChange={e => setSellerId(e.target.value)} />
          </Row>

          <PrimaryButton disabled={loading} onClick={initiate}>Start Escrow Transaction</PrimaryButton>
        </Card>

        <Card>
          <h2>Landed Cost Estimate</h2>
          <CostList>
            {cost.breakdown.map(item => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>€{item.amount.toLocaleString('bg-BG')}</strong>
              </li>
            ))}
          </CostList>

          <Total>
            <span>Total Landed Cost</span>
            <strong>€{cost.totalLandedCost.toLocaleString('bg-BG')}</strong>
          </Total>

          {transaction && (
            <InfoBox>
              <div><strong>Escrow ID:</strong> {transaction.id}</div>
              <div><strong>Status:</strong> {transaction.status}</div>
              <div><strong>Estimated Transit:</strong> {transaction.importDetails.estimatedDays} days</div>
              <div><strong>Total Protected Amount:</strong> €{transaction.amounts.totalCost.toLocaleString('bg-BG')}</div>
            </InfoBox>
          )}
        </Card>
      </Grid>
    </Page>
  );
};

const Page = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 16px 36px;
`;

const Header = styled.div`
  margin-bottom: 20px;
  h1 {
    margin: 0 0 6px;
    font-size: 30px;
  }
  p {
    margin: 0;
    color: #475569;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;

  h2 {
    margin: 0 0 14px;
    font-size: 18px;
  }

  h3 {
    margin: 12px 0;
    font-size: 15px;
    color: #334155;
  }
`;

const Row = styled.div`
  display: grid;
  gap: 6px;
  margin-bottom: 12px;

  label {
    font-size: 13px;
    color: #334155;
    font-weight: 600;
  }

  input,
  select {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

const CostList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #e2e8f0;
    color: #334155;
  }
`;

const Total = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  border-radius: 10px;
  padding: 10px 12px;

  strong {
    font-size: 18px;
    color: #166534;
  }
`;

const InfoBox = styled.div`
  margin-top: 12px;
  border: 1px solid #dbeafe;
  background: #f8fbff;
  border-radius: 10px;
  padding: 10px 12px;
  display: grid;
  gap: 4px;
  font-size: 14px;
`;

export default CrossBorderEscrowPage;
