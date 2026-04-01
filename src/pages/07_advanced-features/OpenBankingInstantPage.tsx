import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { isFeatureEnabled } from '@/config/feature-flags';
import {
  openBankingService,
  CreditScoreResult,
  LoanApplication,
  LoanOffer,
} from '@/services/financing/open-banking.service';
import { serviceLogger } from '@/services/logger-service';

const OpenBankingInstantPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Feature flag gate: Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_OPEN_BANKING')) {
      navigate('/financing');
    }
  }, [navigate]);

  // Early return while feature flag is false
  if (!isFeatureEnabled('ENABLE_OPEN_BANKING')) {
    return null;
  }

  const [monthlyIncome, setMonthlyIncome] = useState(2500);
  const [existingDebt, setExistingDebt] = useState(250);
  const [yearsEmployed, setYearsEmployed] = useState(3);
  const [age, setAge] = useState(32);
  const [employmentType, setEmploymentType] = useState<'employed' | 'self_employed' | 'retired' | 'other'>('employed');
  const [hasDefaultHistory, setHasDefaultHistory] = useState(false);

  const [carPrice, setCarPrice] = useState(28000);
  const [downPayment, setDownPayment] = useState(5600);
  const [termMonths, setTermMonths] = useState(60);

  const [score, setScore] = useState<CreditScoreResult | null>(null);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = user?.uid || null;

  const selectedOffer = useMemo<LoanOffer | null>(() => {
    if (!application?.offers?.length) return null;
    return application.offers[0] ?? null;
  }, [application]);

  const runScore = async () => {
    if (!userId) {
      toast.error('Please sign in first to run instant pre-approval.');
      return;
    }

    setLoading(true);
    try {
      const result = await openBankingService.performCreditScore(userId, {
        monthlyIncome,
        employmentType,
        yearsEmployed,
        existingDebt,
        hasDefaultHistory,
        age,
      });
      setScore(result);
      toast.success(`Credit score ready: ${result.score} (${result.rating})`);
    } catch (error) {
      serviceLogger.error('OpenBanking page: score failed', error as Error);
      toast.error('Could not complete credit scoring.');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async () => {
    if (!userId) {
      toast.error('Please sign in first to submit a financing application.');
      return;
    }

    setLoading(true);
    try {
      const app = await openBankingService.submitApplication({
        userId,
        carId: 'manual_financing_flow',
        personalInfo: {
          fullName: user?.displayName || 'Koli User',
          egn: '0000000000',
          phone: user?.phoneNumber || '+359000000000',
          email: user?.email || 'user@koli.one',
          monthlyIncome,
          employmentType,
          employerName: employmentType === 'employed' ? 'Employer' : undefined,
        },
        carPrice,
        downPayment,
        requestedTermMonths: termMonths,
      });

      setApplication(app);
      toast.success(`Application submitted with ${app.offers.length} instant offers.`);
    } catch (error) {
      serviceLogger.error('OpenBanking page: submit failed', error as Error);
      toast.error('Could not submit financing application.');
    } finally {
      setLoading(false);
    }
  };

  const acceptTopOffer = async () => {
    if (!application || !selectedOffer) return;

    setLoading(true);
    try {
      await openBankingService.acceptOffer(application.id, selectedOffer.id);
      toast.success(`Offer accepted from ${selectedOffer.bankName}.`);
    } catch (error) {
      serviceLogger.error('OpenBanking page: accept offer failed', error as Error);
      toast.error('Could not accept the selected offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Helmet>
        <title>Instant Financing Pre-Approval | Koli One</title>
      </Helmet>

      <Header>
        <h1>Instant Financing Pre-Approval</h1>
        <p>Run credit scoring and receive pre-approved offers in one flow.</p>
      </Header>

      <Grid>
        <Card>
          <h2>Profile & Income</h2>

          <Row>
            <label>Monthly Income (EUR)</label>
            <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Existing Monthly Debt (EUR)</label>
            <input type="number" value={existingDebt} onChange={e => setExistingDebt(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Years Employed</label>
            <input type="number" value={yearsEmployed} onChange={e => setYearsEmployed(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Age</label>
            <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Employment Type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value as 'employed' | 'self_employed' | 'retired' | 'other')}>
              <option value="employed">Employed</option>
              <option value="self_employed">Self-employed</option>
              <option value="retired">Retired</option>
              <option value="other">Other</option>
            </select>
          </Row>

          <CheckRow>
            <input id="defaults" type="checkbox" checked={hasDefaultHistory} onChange={e => setHasDefaultHistory(e.target.checked)} />
            <label htmlFor="defaults">Has default history</label>
          </CheckRow>

          <PrimaryButton disabled={loading} onClick={runScore}>Run Instant Score</PrimaryButton>

          {score && (
            <InfoBox>
              <div><strong>Score:</strong> {score.score}</div>
              <div><strong>Rating:</strong> {score.rating}</div>
              <div><strong>Max Loan:</strong> €{score.maxLoanAmount.toLocaleString('bg-BG')}</div>
              <div><strong>Suggested Rate:</strong> {score.suggestedRate.toFixed(2)}%</div>
            </InfoBox>
          )}
        </Card>

        <Card>
          <h2>Vehicle Financing Request</h2>

          <Row>
            <label>Car Price (EUR)</label>
            <input type="number" value={carPrice} onChange={e => setCarPrice(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Down Payment (EUR)</label>
            <input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} />
          </Row>

          <Row>
            <label>Term (months)</label>
            <input type="number" value={termMonths} onChange={e => setTermMonths(Number(e.target.value))} />
          </Row>

          <PrimaryButton disabled={loading} onClick={submitApplication}>Get Instant Offers</PrimaryButton>

          {application && (
            <InfoBox>
              <div><strong>Status:</strong> {application.status}</div>
              <div><strong>Offers:</strong> {application.offers.length}</div>
              {selectedOffer && (
                <>
                  <div><strong>Top Bank:</strong> {selectedOffer.bankName}</div>
                  <div><strong>Monthly:</strong> €{selectedOffer.monthlyPayment.toLocaleString('bg-BG')}</div>
                  <div><strong>Rate:</strong> {selectedOffer.annualRate.toFixed(2)}%</div>
                </>
              )}
            </InfoBox>
          )}

          <ButtonRow>
            <SecondaryButton disabled={!selectedOffer || loading} onClick={acceptTopOffer}>Accept Top Offer</SecondaryButton>
            <SecondaryButton onClick={() => navigate('/financing/compare')}>Compare All Banks</SecondaryButton>
          </ButtonRow>
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

  input,
  select {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
  }
`;

const CheckRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 4px 0 14px;

  label {
    font-size: 14px;
    color: #1e293b;
  }
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

const SecondaryButton = styled.button`
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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

export default OpenBankingInstantPage;
