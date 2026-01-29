/**
 * Credits Wallet System
 * Internal currency for micro-transactions
 * 
 * File: src/components/billing/CreditsWallet.tsx
 * Created: January 8, 2026
 * Based on: Carvana, Cars.com token systems
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
  Coins, Plus, Minus, History, Gift, Zap, 
  TrendingUp, Star, Crown, Sparkles, ArrowRight,
  Check, X, ChevronRight, RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';

// ==================== ANIMATIONS ====================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const coinFlip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
`;

// ==================== STYLED COMPONENTS ====================

const WalletContainer = styled.div`
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--border-primary);
  animation: ${fadeIn} 0.6s ease-out;
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const WalletTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WalletIcon = styled.span`
  font-size: 2rem;
`;

// ==================== BALANCE DISPLAY ====================

const BalanceCard = styled.div`
  background: linear-gradient(135deg, 
    #FFD700 0%, 
    #FFA500 50%,
    #FF8C00 100%
  );
  border-radius: 20px;
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
  animation: ${glow} 3s ease-in-out infinite;
  
  &::before {
    content: '💎';
    position: absolute;
    right: -20px;
    top: -20px;
    font-size: 8rem;
    opacity: 0.15;
    transform: rotate(15deg);
  }
`;

const BalanceLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const BalanceAmount = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const BalanceValue = styled.span`
  font-size: 3.5rem;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const BalanceUnit = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
`;

const BalanceEuro = styled.div`
  font-size: 1rem;
  opacity: 0.85;
  margin-top: 0.5rem;
`;

// ==================== CREDIT PACKAGES ====================

const PackagesSection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PackageCard = styled.div<{ $popular?: boolean; $selected?: boolean }>`
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${p => p.$popular && css`
    border: 2px solid var(--accent-primary);
    transform: scale(1.02);
  `}
  
  ${p => p.$selected && css`
    border: 3px solid #10b981;
    background: rgba(16, 185, 129, 0.1);
  `}
  
  ${p => !p.$selected && !p.$popular && css`
    border: 2px solid var(--border-secondary);
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-primary);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
`;

const PackageCredits = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const PackagePrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const PackagePerCredit = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const PackageSaving = styled.div`
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  color: #10b981;
  font-size: 0.85rem;
  font-weight: 600;
`;

// ==================== SPENDING OPTIONS ====================

const SpendingSection = styled.div`
  margin-top: 2rem;
`;

const SpendingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SpendingItem = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 2px solid var(--border-secondary);
  transition: all 0.3s ease;
  
  ${p => p.$disabled ? css`
    opacity: 0.5;
    cursor: not-allowed;
  ` : css`
    cursor: pointer;
    
    &:hover {
      border-color: var(--accent-primary);
      background: rgba(102, 126, 234, 0.05);
    }
  `}
`;

const SpendingLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SpendingIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 22px;
    height: 22px;
    color: white;
  }
`;

const SpendingInfo = styled.div``;

const SpendingName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const SpendingDesc = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const SpendingCost = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// ==================== TRANSACTION HISTORY ====================

const HistorySection = styled.div`
  margin-top: 2rem;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
`;

const HistoryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HistoryIcon = styled.div<{ $type: 'add' | 'spend' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${p => p.$type === 'add' 
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
    color: white;
  }
`;

const HistoryInfo = styled.div``;

const HistoryDesc = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const HistoryDate = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const HistoryAmount = styled.div<{ $type: 'add' | 'spend' }>`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${p => p.$type === 'add' ? '#10b981' : '#f59e0b'};
`;

// ==================== BUY BUTTON ====================

const BuyButton = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: ${p => p.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  
  ${p => p.$disabled ? css`
    background: var(--bg-tertiary);
    color: var(--text-muted);
  ` : css`
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #1a1a1a;
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
    }
  `}
`;

// ==================== MODAL ====================

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: var(--bg-card);
  border-radius: 24px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-primary);
    color: white;
  }
`;

// ==================== TYPES ====================

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  saving?: number;
  popular?: boolean;
}

interface SpendingOption {
  id: string;
  name: { bg: string; en: string };
  description: { bg: string; en: string };
  credits: number;
  icon: React.ReactNode;
  color: string;
}

interface Transaction {
  id: string;
  type: 'add' | 'spend';
  description: string;
  amount: number;
  date: Date;
}

// ==================== MAIN COMPONENT ====================

interface CreditsWalletProps {
  initialCredits?: number;
  onPurchaseCredits?: (packageId: string) => void;
  onSpendCredits?: (optionId: string, listingId?: string) => void;
}

export const CreditsWallet: React.FC<CreditsWalletProps> = ({
  initialCredits = 25,
  onPurchaseCredits,
  onSpendCredits
}) => {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const [credits, setCredits] = useState(initialCredits);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'add', description: 'Закупени 100 кредита', amount: 100, date: new Date(Date.now() - 86400000 * 2) },
    { id: '2', type: 'spend', description: 'VIP Badge - BMW X5', amount: -20, date: new Date(Date.now() - 86400000) },
    { id: '3', type: 'spend', description: 'Instant Refresh - Audi A4', amount: -10, date: new Date() }
  ]);

  const t = {
    bg: {
      wallet: '💎 Моят Портфейл',
      balance: 'Текущ баланс',
      credits: 'кредити',
      equalTo: 'Равностойност',
      buyCredits: '💳 Купи Кредити',
      selectPackage: 'Избери пакет',
      perCredit: '/кредит',
      save: 'Спестяваш',
      popular: '⭐ Популярен',
      spendCredits: '🚀 Използвай Кредити',
      history: '📜 История',
      vipBadge: 'VIP Значка',
      vipDesc: 'Златна значка за 7 дни',
      topPage: 'Върху Страницата',
      topDesc: 'Закачено в началото за 3 дни',
      refresh: 'Моментално Обновяване',
      refreshDesc: 'Скокни в началото сега',
      message: 'Премиум Съобщение',
      messageDesc: 'Маркирано съобщение',
      buyNow: 'Купи сега',
      notEnough: 'Недостатъчно кредити',
      confirmPurchase: 'Потвърди покупката',
      total: 'Общо'
    },
    en: {
      wallet: '💎 My Wallet',
      balance: 'Current Balance',
      credits: 'credits',
      equalTo: 'Equivalent to',
      buyCredits: '💳 Buy Credits',
      selectPackage: 'Select a package',
      perCredit: '/credit',
      save: 'You save',
      popular: '⭐ Popular',
      spendCredits: '🚀 Use Credits',
      history: '📜 History',
      vipBadge: 'VIP Badge',
      vipDesc: 'Gold badge for 7 days',
      topPage: 'Top of Page',
      topDesc: 'Pinned at top for 3 days',
      refresh: 'Instant Refresh',
      refreshDesc: 'Jump to top now',
      message: 'Premium Message',
      messageDesc: 'Highlighted message',
      buyNow: 'Buy now',
      notEnough: 'Not enough credits',
      confirmPurchase: 'Confirm purchase',
      total: 'Total'
    }
  };
  
  const text = t[language] || t.en;

  const packages: CreditPackage[] = [
    { id: 'small', credits: 50, price: 5, pricePerCredit: 0.10 },
    { id: 'medium', credits: 100, price: 9, pricePerCredit: 0.09, saving: 10, popular: true },
    { id: 'large', credits: 200, price: 15, pricePerCredit: 0.075, saving: 25 }
  ];

  const spendingOptions: SpendingOption[] = [
    {
      id: 'vip_badge',
      name: { bg: 'VIP Значка', en: 'VIP Badge' },
      description: { bg: 'Златна значка за 7 дни', en: 'Gold badge for 7 days' },
      credits: 20,
      icon: <Crown />,
      color: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
    },
    {
      id: 'top_of_page',
      name: { bg: 'Върху Страницата', en: 'Top of Page' },
      description: { bg: 'Закачено за 3 дни', en: 'Pinned for 3 days' },
      credits: 50,
      icon: <TrendingUp />,
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      id: 'instant_refresh',
      name: { bg: 'Моментално Обновяване', en: 'Instant Refresh' },
      description: { bg: 'Скочи в началото', en: 'Jump to top' },
      credits: 10,
      icon: <RefreshCw />,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 'premium_message',
      name: { bg: 'Премиум Съобщение', en: 'Premium Message' },
      description: { bg: 'Маркирано съобщение', en: 'Highlighted message' },
      credits: 5,
      icon: <Sparkles />,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackage(selectedPackage === pkgId ? null : pkgId);
  };

  const handleBuyCredits = () => {
    if (!selectedPackage) return;
    
    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;
    
    logger.info('Credits purchased', { packageId: selectedPackage, credits: pkg.credits });
    
    // Add credits
    setCredits(prev => prev + pkg.credits);
    
    // Add transaction
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'add',
      description: `Закупени ${pkg.credits} кредита`,
      amount: pkg.credits,
      date: new Date()
    }, ...prev]);
    
    setSelectedPackage(null);
    setShowBuyModal(false);
    
    onPurchaseCredits?.(selectedPackage);
  };

  const handleSpendCredits = (option: SpendingOption) => {
    if (credits < option.credits) return;
    
    logger.info('Credits spent', { optionId: option.id, credits: option.credits });
    
    // Deduct credits
    setCredits(prev => prev - option.credits);
    
    // Add transaction
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'spend',
      description: option.name[language],
      amount: -option.credits,
      date: new Date()
    }, ...prev]);
    
    onSpendCredits?.(option.id);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return language === 'bg' ? 'Днес' : 'Today';
    if (days === 1) return language === 'bg' ? 'Вчера' : 'Yesterday';
    return `${days} ${language === 'bg' ? 'дни преди' : 'days ago'}`;
  };

  return (
    <WalletContainer>
      <WalletHeader>
        <WalletTitle>
          <WalletIcon>💎</WalletIcon>
          {text.wallet}
        </WalletTitle>
      </WalletHeader>

      {/* Balance Card */}
      <BalanceCard>
        <BalanceLabel>{text.balance}</BalanceLabel>
        <BalanceAmount>
          <BalanceValue>{credits.toLocaleString()}</BalanceValue>
          <BalanceUnit>{text.credits}</BalanceUnit>
        </BalanceAmount>
        <BalanceEuro>
          ≈ {(credits * 0.09).toFixed(2)}€ {text.equalTo.toLowerCase()}
        </BalanceEuro>
      </BalanceCard>

      {/* Buy Credits Section */}
      <PackagesSection>
        <SectionTitle>
          <Plus size={20} />
          {text.buyCredits}
        </SectionTitle>
        <PackagesGrid>
          {packages.map(pkg => (
            <PackageCard 
              key={pkg.id}
              $popular={pkg.popular}
              $selected={selectedPackage === pkg.id}
              onClick={() => handleSelectPackage(pkg.id)}
            >
              {pkg.popular && <PopularBadge>{text.popular}</PopularBadge>}
              <PackageCredits>
                <Coins size={24} />
                {pkg.credits}
              </PackageCredits>
              <PackagePrice>{pkg.price}€</PackagePrice>
              <PackagePerCredit>
                ({pkg.pricePerCredit.toFixed(2)}€ {text.perCredit})
              </PackagePerCredit>
              {pkg.saving && (
                <PackageSaving>
                  🎁 {text.save} {pkg.saving}%
                </PackageSaving>
              )}
            </PackageCard>
          ))}
        </PackagesGrid>
        
        <BuyButton 
          $disabled={!selectedPackage}
          onClick={() => selectedPackage && setShowBuyModal(true)}
        >
          <Coins size={22} />
          {text.buyNow}
          {selectedPackage && (
            <>
              - {packages.find(p => p.id === selectedPackage)?.price}€
            </>
          )}
        </BuyButton>
      </PackagesSection>

      {/* Spend Credits Section */}
      <SpendingSection>
        <SectionTitle>
          <Zap size={20} />
          {text.spendCredits}
        </SectionTitle>
        <SpendingGrid>
          {spendingOptions.map(option => (
            <SpendingItem 
              key={option.id}
              $disabled={credits < option.credits}
              onClick={() => handleSpendCredits(option)}
            >
              <SpendingLeft>
                <SpendingIcon $color={option.color}>
                  {option.icon}
                </SpendingIcon>
                <SpendingInfo>
                  <SpendingName>{option.name[language]}</SpendingName>
                  <SpendingDesc>{option.description[language]}</SpendingDesc>
                </SpendingInfo>
              </SpendingLeft>
              <SpendingCost>
                <Coins />
                {option.credits}
              </SpendingCost>
            </SpendingItem>
          ))}
        </SpendingGrid>
      </SpendingSection>

      {/* Transaction History */}
      <HistorySection>
        <SectionTitle>
          <History size={20} />
          {text.history}
        </SectionTitle>
        <HistoryList>
          {transactions.slice(0, 5).map(tx => (
            <HistoryItem key={tx.id}>
              <HistoryLeft>
                <HistoryIcon $type={tx.type}>
                  {tx.type === 'add' ? <Plus /> : <Minus />}
                </HistoryIcon>
                <HistoryInfo>
                  <HistoryDesc>{tx.description}</HistoryDesc>
                  <HistoryDate>{formatDate(tx.date)}</HistoryDate>
                </HistoryInfo>
              </HistoryLeft>
              <HistoryAmount $type={tx.type}>
                {tx.type === 'add' ? '+' : ''}{tx.amount}
              </HistoryAmount>
            </HistoryItem>
          ))}
        </HistoryList>
      </HistorySection>

      {/* Purchase Confirmation Modal */}
      {showBuyModal && selectedPackage && (
        <ModalOverlay onClick={() => setShowBuyModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{text.confirmPurchase}</ModalTitle>
              <CloseButton onClick={() => setShowBuyModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            
            {(() => {
              const pkg = packages.find(p => p.id === selectedPackage);
              if (!pkg) return null;
              
              return (
                <>
                  <PackageCard $selected style={{ marginBottom: '1.5rem' }}>
                    <PackageCredits>
                      <Coins size={28} />
                      {pkg.credits}
                    </PackageCredits>
                    <PackagePrice style={{ fontSize: '2rem' }}>{pkg.price}€</PackagePrice>
                    {pkg.saving && (
                      <PackageSaving>
                        🎁 {text.save} {pkg.saving}%
                      </PackageSaving>
                    )}
                  </PackageCard>
                  
                  <BuyButton onClick={handleBuyCredits}>
                    <Check size={22} />
                    {text.total}: {pkg.price}€
                  </BuyButton>
                </>
              );
            })()}
          </ModalContent>
        </ModalOverlay>
      )}
    </WalletContainer>
  );
};

export default CreditsWallet;
