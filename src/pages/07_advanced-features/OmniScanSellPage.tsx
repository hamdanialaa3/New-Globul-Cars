import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isFeatureEnabled } from '@/config/feature-flags';
import { omniScanService, VINDecodeResult, AutoFillData } from '@/services/ai/omni-scan.service';
import { serviceLogger } from '@/services/logger-service';

const OmniScanSellPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Feature flag gate: Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_OMNI_SCAN_AI')) {
      navigate('/sell');
    }
  }, [navigate]);

  // Early return while feature flag is false
  if (!isFeatureEnabled('ENABLE_OMNI_SCAN_AI')) {
    return null;
  }

  const [vin, setVin] = useState('WBA5A7C57GG123456');
  const [mileageKm, setMileageKm] = useState(98000);
  const [color, setColor] = useState('Black');
  const [licensePlate, setLicensePlate] = useState('CB1234AB');

  const [vinDecoded, setVinDecoded] = useState<VINDecodeResult | null>(null);
  const [autoFill, setAutoFill] = useState<AutoFillData | null>(null);
  const [stolenStatus, setStolenStatus] = useState<{ isStolen: boolean; source: string; details?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDecode = async () => {
    setLoading(true);
    try {
      const result = await omniScanService.decodeVIN(vin);
      setVinDecoded(result);
      const fill = omniScanService.generateAutoFill(result, {
        mileageKm,
        color,
        licensePlate,
      });
      setAutoFill(fill);

      const stolen = await omniScanService.checkStolen(vin);
      setStolenStatus(stolen);

      toast.success(`VIN decoded for ${result.decoded.make} ${result.decoded.year}`);
    } catch (error) {
      serviceLogger.error('OmniScan page: decode failed', error as Error);
      toast.error('Could not decode VIN. Please check input.');
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    if (!user?.uid || !autoFill) {
      toast.error('Sign in and decode VIN first.');
      return;
    }

    setLoading(true);
    try {
      const sessionId = await omniScanService.createScanSession(user.uid, 'vin_plate');
      await omniScanService.completeScanSession(sessionId, {
        id: sessionId,
        userId: user.uid,
        scanMode: 'vin_plate',
        status: 'auto_filled',
        raw: {
          detectedText: vin,
          confidence: autoFill.overallConfidence,
        },
        vin: vinDecoded || undefined,
        autoFill,
        processingTimeMs: 1500,
        createdAt: new Date(),
      });
      toast.success('Scan session saved. Continuing to sell flow...');
      navigate('/sell/auto');
    } catch (error) {
      serviceLogger.error('OmniScan page: session save failed', error as Error);
      toast.error('Could not save scan session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Helmet>
        <title>Omni-Scan AI | 15-second Listing Flow</title>
      </Helmet>

      <Header>
        <h1>Omni-Scan AI</h1>
        <p>Decode VIN, auto-fill listing data, and jump directly to Sell Workflow.</p>
      </Header>

      <Grid>
        <Card>
          <h2>Scan Inputs</h2>

          <Row>
            <label>VIN (17 chars)</label>
            <input value={vin} onChange={e => setVin(e.target.value.toUpperCase())} />
          </Row>

          <Row>
            <label>Mileage (km)</label>
            <input type="number" value={mileageKm} onChange={e => setMileageKm(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Color</label>
            <input value={color} onChange={e => setColor(e.target.value)} />
          </Row>

          <Row>
            <label>License Plate (BG)</label>
            <input value={licensePlate} onChange={e => setLicensePlate(e.target.value.toUpperCase())} />
          </Row>

          <ButtonRow>
            <PrimaryButton disabled={loading} onClick={handleDecode}>Decode VIN & Auto-Fill</PrimaryButton>
            <SecondaryButton disabled={!autoFill || loading} onClick={saveSession}>Save Session & Start Sell</SecondaryButton>
          </ButtonRow>
        </Card>

        <Card>
          <h2>Decoded Vehicle</h2>
          {!vinDecoded && <EmptyState>Run decode to see vehicle details.</EmptyState>}

          {vinDecoded && (
            <InfoBox>
              <div><strong>Make:</strong> {vinDecoded.decoded.make}</div>
              <div><strong>Year:</strong> {vinDecoded.decoded.year}</div>
              <div><strong>Fuel:</strong> {vinDecoded.decoded.fuelType}</div>
              <div><strong>Body:</strong> {vinDecoded.decoded.bodyType}</div>
              <div><strong>Country:</strong> {vinDecoded.decoded.country}</div>
            </InfoBox>
          )}

          {stolenStatus && (
            <StatusPill safe={!stolenStatus.isStolen}>
              {stolenStatus.isStolen ? 'Warning: reported in stolen DB' : 'Stolen check clear'}
            </StatusPill>
          )}

          {autoFill && (
            <InfoBox>
              <div><strong>Title:</strong> {autoFill.titleEn}</div>
              <div><strong>Confidence:</strong> {(autoFill.overallConfidence * 100).toFixed(1)}%</div>
              <div><strong>Filled Fields:</strong> {autoFill.filledFieldCount}/{autoFill.totalFieldCount}</div>
              <div><strong>Description:</strong> {autoFill.descriptionEn}</div>
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

  input {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const PrimaryButton = styled.button`
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`;

const SecondaryButton = styled.button`
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
`;

const EmptyState = styled.div`
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 14px;
  color: #64748b;
  font-size: 14px;
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

const StatusPill = styled.div<{ safe: boolean }>`
  margin-top: 10px;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  width: fit-content;
  border: 1px solid ${p => (p.safe ? '#86efac' : '#fca5a5')};
  background: ${p => (p.safe ? '#f0fdf4' : '#fef2f2')};
  color: ${p => (p.safe ? '#166534' : '#b91c1c')};
`;

export default OmniScanSellPage;
