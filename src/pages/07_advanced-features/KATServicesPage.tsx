import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '@/contexts/LanguageContext';
import { navigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiExternalLink, FiShield, FiGlobe, 
  FiMapPin, FiCheckCircle, FiFileText, FiActivity, 
  FiCreditCard, FiInfo, FiZap, FiTruck, FiAlertTriangle,
  FiSearch
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 4rem 1rem;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, var(--accent-light) 0%, transparent 70%);
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const MainTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 950;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: -0.04em;
  background: var(--btn-primary-bg);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto;
  font-weight: 500;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 5rem 0 3rem;
  
  h2 { font-size: 1.8rem; font-weight: 900; color: var(--text-primary); white-space: nowrap; }
  &::after { content: ''; flex: 1; height: 1px; background: var(--border-primary); }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2.5rem;
`;

const GlassCard = styled.div<{ $bgImg?: string }>`
  position: relative;
  border-radius: 40px;
  padding: 3rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  border: 1px solid var(--border-primary);
  background: var(--bg-card);

  /* Full Background Image Layer */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: ${props => props.$bgImg ? `url(${props.$bgImg})` : 'none'};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15;
    z-index: 0;
    transition: all 0.6s ease;
    filter: grayscale(100%) blur(1px);
  }

  /* Overlay for readability */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, 
      rgba(var(--bg-card-rgb), 0.7) 0%, 
      rgba(var(--bg-card-rgb), 0.95) 100%);
    z-index: 1;
    transition: all 0.4s ease;
  }

  &:hover {
    transform: translateY(-10px);
    border-color: var(--accent-primary);
    box-shadow: var(--shadow-xl);
    
    &::before {
      opacity: 0.25;
      filter: grayscale(0%) blur(0px);
      transform: scale(1.08);
    }
    
    &::after {
      background: linear-gradient(180deg, 
        rgba(var(--bg-card-rgb), 0.4) 0%, 
        rgba(var(--bg-card-rgb), 0.85) 100%);
    }
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardIcon = styled.div<{ $bg: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.$bg}25;
  color: ${props => props.$bg};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 2.2rem;
  border: 1px solid ${props => props.$bg}40;
  backdrop-filter: blur(8px);
`;

const CardTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 900;
  margin-bottom: 1.2rem;
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CardText = styled.p`
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 2.5rem;
  flex: 1;
  font-weight: 500;
`;

const LinkGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
`;

const LinkButton = styled.a<{ $primary?: boolean; $accent?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1.1rem;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-align: center;
  
  ${props => props.$primary ? `
    background: var(--btn-primary-bg);
    color: white !important;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    &:hover { background: var(--btn-primary-hover); transform: scale(1.05); box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5); }
  ` : props.$accent ? `
    background: #FF5722;
    color: white !important;
    box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
    &:hover { background: #F4511E; transform: scale(1.05); box-shadow: 0 10px 30px rgba(255, 87, 34, 0.5); }
  ` : `
    background: var(--bg-card);
    color: var(--text-primary) !important;
    border: 1px solid var(--border-primary);
    backdrop-filter: blur(8px);
    &:hover { background: var(--bg-hover); color: var(--accent-primary) !important; border-color: var(--accent-primary); transform: translateY(-4px); }
  `}
`;

const RegionalItem = styled.a`
  font-size: 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 1rem;
  border-radius: 18px;
  background: var(--bg-hover);
  text-align: center;
  transition: all 0.25s ease;
  border: 1px solid var(--border-primary);
  font-weight: 750;
  backdrop-filter: blur(4px);

  &:hover {
    color: var(--accent-primary);
    border-color: var(--accent-primary);
    background: var(--bg-card);
    transform: translateY(-5px) scale(1.04);
    box-shadow: var(--shadow-md);
  }
`;

const StepGuide = styled.div`
  margin-top: 8rem;
  padding: 6rem 4rem;
  background: var(--bg-secondary);
  border-radius: 64px;
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4rem;
  margin-top: 5rem;
  position: relative;
  z-index: 10;
  
  @media (max-width: 1024px) { flex-direction: column; }
`;

const StepItem = styled.div`
  flex: 1;
  text-align: center;
  
  .num {
    font-size: 4.5rem;
    font-weight: 950;
    color: var(--accent-light);
    margin-bottom: -1.8rem;
    font-family: 'Outfit', sans-serif;
    opacity: 0.5;
  }
  
  h4 { font-size: 1.6rem; font-weight: 900; margin-bottom: 1.5rem; color: var(--text-primary); }
  p { color: var(--text-secondary); font-size: 1.1rem; line-height: 1.8; }
`;

const BackBtn = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
  padding: 0.8rem 1.6rem;
  border-radius: 100px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 100;
  box-shadow: var(--shadow-md);
  
  &:hover { background: var(--accent-light); color: var(--accent-primary); transform: translateX(-8px); border-color: var(--accent-primary); }
`;

const ProBanner = styled.div`
  margin-top: 6rem;
  background: var(--aurora-gradient-soft);
  border: 1px solid var(--border-accent);
  padding: 3.5rem;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  position: relative;
  z-index: 2;
  
  svg { font-size: 4rem; color: var(--accent-primary); flex-shrink: 0; }
  p { margin: 0; color: var(--text-primary); font-weight: 800; font-size: 1.3rem; line-height: 1.6; }

  @media (max-width: 640px) { flex-direction: column; text-align: center; padding: 2.5rem; }
`;

const KATServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <PageContainer id="main-content">
      <BackBtn onClick={() => navigate('/')}>
        <FiArrowLeft /> {t('common.back')}
      </BackBtn>

      <ContentWrapper>
        <Header>
          <MainTitle>{t('kat.pageTitle')}</MainTitle>
          <Subtitle>{t('kat.pageSubtitle')}</Subtitle>
        </Header>

        {/* --- 1. GOVERNMENT & REGISTRATION --- */}
        <SectionHeader>
          <h2><FiGlobe /> {t('kat.secOfficial')}</h2>
        </SectionHeader>
        <Grid>
          <GlassCard $bgImg="/assets/images/07_advanced-features/kat-police.png">
            <CardContent>
              <CardIcon $bg="#2563eb"><FiShield /></CardIcon>
              <CardTitle>{t('kat.card1Title')}</CardTitle>
              <CardText>{t('kat.card1Desc')}</CardText>
              <LinkGroup>
                <LinkButton href="https://e-uslugi.mvr.bg/" target="_blank" $primary style={{gridColumn: 'span 2'}}>
                  <FiExternalLink /> {t('kat.btnVisit1')}
                </LinkButton>
                <LinkButton href="https://e-uslugi.mvr.bg/services/applicationProcesses/501" target="_blank" $accent style={{gridColumn: 'span 2'}}>
                  <FiSearch /> {t('kat.btnCheckFines')}
                </LinkButton>
                <LinkButton href="https://e-uslugi.mvr.bg/services/applicationProcesses/360" target="_blank">
                  {t('kat.btnReg1')}
                </LinkButton>
                <LinkButton href="https://www.mvr.bg/pl-kat" target="_blank">
                  {t('kat.katPortal')}
                </LinkButton>
              </LinkGroup>
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardContent>
              <CardIcon $bg="#7c3aed"><FiMapPin /></CardIcon>
              <CardTitle>{t('kat.card3Title')}</CardTitle>
              <CardText>{t('kat.card3Desc')}</CardText>
              <LinkGroup>
                <RegionalItem href="https://www.mvr.bg/sofia" target="_blank">{t('kat.regSofia')}</RegionalItem>
                <RegionalItem href="https://www.mvr.bg/plovdiv" target="_blank">{t('kat.regPlovdiv')}</RegionalItem>
                <RegionalItem href="https://www.mvr.bg/varna" target="_blank">{t('kat.regVarna')}</RegionalItem>
                <RegionalItem href="https://www.mvr.bg/burgas" target="_blank">{t('kat.regBurgas')}</RegionalItem>
                <RegionalItem href="https://www.mvr.bg/stara-zagora" target="_blank">{t('kat.regStara')}</RegionalItem>
                <RegionalItem href="https://www.mvr.bg/ruse" target="_blank">{t('kat.regRuse')}</RegionalItem>
              </LinkGroup>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* --- 2. INSURANCE & COMPARISON --- */}
        <SectionHeader>
          <h2><FiZap /> {t('kat.secInsurance')}</h2>
        </SectionHeader>
        <Grid>
          <GlassCard $bgImg="/assets/images/07_advanced-features/kat-insurance.png">
            <CardContent>
              <CardIcon $bg="#10b981"><FiShield /></CardIcon>
              <CardTitle>{t('kat.insTitle')}</CardTitle>
              <CardText>{t('kat.insDesc')}</CardText>
              <LinkGroup>
                <LinkButton href="https://www.sdi.bg/" target="_blank" $primary>{t('kat.brokerSDI')}</LinkButton>
                <LinkButton href="https://boleron.bg/" target="_blank" $primary>{t('kat.brokerBoleron')}</LinkButton>
                <LinkButton href="https://www.lev-ins.com/" target="_blank">{t('kat.insCompanyLevIns')}</LinkButton>
                <LinkButton href="https://www.bulstrad.bg/" target="_blank">{t('kat.insCompanyBulstrad')}</LinkButton>
                <LinkButton href="https://www.allianz.bg/bg_BG/individuals/car-insurance.html" target="_blank">Allianz</LinkButton>
                <LinkButton href="https://www.generali.bg/" target="_blank">Generali</LinkButton>
              </LinkGroup>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* --- 3. TOLLS & MAINTENANCE --- */}
        <SectionHeader>
          <h2><FiTruck /> {t('kat.secMaintenance')}</h2>
        </SectionHeader>
        <Grid>
          <GlassCard $bgImg="/assets/images/07_advanced-features/kat-vignette.png">
            <CardContent>
              <CardIcon $bg="#f59e0b"><FiActivity /></CardIcon>
              <CardTitle>{t('kat.bgTollTitle')}</CardTitle>
              <CardText>{t('kat.bgTollDesc')}</CardText>
              <LinkGroup>
                <LinkButton href="https://bgtoll.bg/" target="_blank" $primary style={{gridColumn: 'span 2'}}>
                  <FiExternalLink /> {t('kat.buyVignette')}
                </LinkButton>
                <LinkButton href="https://check.bgtoll.bg/" target="_blank" style={{gridColumn: 'span 2'}}>
                  {t('kat.checkValidity')}
                </LinkButton>
              </LinkGroup>
            </CardContent>
          </GlassCard>

          <GlassCard $bgImg="/assets/images/07_advanced-features/kat-gtp.png">
            <CardContent>
              <CardIcon $bg="#ec4899"><FiCheckCircle /></CardIcon>
              <CardTitle>{t('kat.gtpTitle')}</CardTitle>
              <CardText>{t('kat.gtpDesc')}</CardText>
              <LinkButton href="https://check.rta.government.bg/" target="_blank" $primary>
                <FiZap /> {t('kat.btnCheckGTP')}
              </LinkButton>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* --- 4. TAXES & PAYMENTS --- */}
        <SectionHeader>
          <h2><FiCreditCard /> {t('kat.secTaxes')}</h2>
        </SectionHeader>
        <Grid>
          <GlassCard $bgImg="/assets/images/07_advanced-features/kat-taxes.png">
            <CardContent>
              <CardIcon $bg="#f43f5e"><FiInfo /></CardIcon>
              <CardTitle>{t('kat.taxesTitle')}</CardTitle>
              <CardText>{t('kat.taxesDesc')}</CardText>
              <LinkGroup>
                <LinkButton href="https://epay.bg/" target="_blank" $primary>ePay.bg</LinkButton>
                <LinkButton href="https://www.easypay.bg/" target="_blank" $primary>EasyPay</LinkButton>
                <RegionalItem href="https://stolica.bg/mestni-danutsi-i-taksi" target="_blank">{t('kat.taxSofia')}</RegionalItem>
                <RegionalItem href="https://www.plovdiv.bg/item/local_taxes/" target="_blank">{t('kat.taxPlovdiv')}</RegionalItem>
                <RegionalItem href="https://varna.bg/bg/varna/taxes" target="_blank">{t('kat.taxVarna')}</RegionalItem>
                <RegionalItem href="https://www.burgas.bg/bg/mestni-danatsi-i-taksi" target="_blank">{t('kat.taxBurgas')}</RegionalItem>
              </LinkGroup>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* --- 5. SMART GUIDE --- */}
        <StepGuide>
          <SectionHeader style={{margin: 0, justifyContent: 'center'}}>
            <h2>{t('kat.secGuide')}</h2>
          </SectionHeader>
          <StepsContainer>
            <StepItem>
              <div className="num">01</div>
              <h4>{t('kat.guideStep1')}</h4>
              <p>{t('kat.guideStep1Desc')}</p>
            </StepItem>
            <StepItem>
              <div className="num">02</div>
              <h4>{t('kat.guideStep2')}</h4>
              <p>{t('kat.guideStep2Desc')}</p>
            </StepItem>
            <StepItem>
              <div className="num">03</div>
              <h4>{t('kat.guideStep3')}</h4>
              <p>{t('kat.guideStep3Desc')}</p>
            </StepItem>
          </StepsContainer>

          <ProBanner>
            <FiAlertTriangle />
            <p>{t('kat.guideTip')}</p>
          </ProBanner>
        </StepGuide>

        <footer style={{marginTop: '6rem', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem'}}>
          <p>{t('kat.safetyTip')}</p>
        </footer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default KATServicesPage;
