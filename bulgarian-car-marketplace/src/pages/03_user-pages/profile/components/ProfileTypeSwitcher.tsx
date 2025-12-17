
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Shield, Briefcase, Building, Check, X, Crown, Info } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase/firebase-config';
import { toast } from 'react-toastify';

// Colors & Gradients
const gradientPrivate = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
const gradientDealer = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
const gradientCompany = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
const glassBg = 'rgba(255, 255, 255, 0.7)';
const glassBorder = 'rgba(255, 255, 255, 0.5)';
const darkGlassBg = 'rgba(30, 41, 59, 0.7)';
const darkGlassBorder = 'rgba(255, 255, 255, 0.1)';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
`;

// Styled Components
const Container = styled.div<{ $isDark?: boolean }>`
  background: ${({ $isDark }) => $isDark ? darkGlassBg : glassBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ $isDark }) => $isDark ? darkGlassBorder : glassBorder};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #f59e0b, #3b82f6);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2<{ $isDark?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled.div<{ $isActive: boolean; $type: 'private' | 'dealer' | 'company'; $isDark?: boolean }>`
  position: relative;
  background: ${({ $isDark, $isActive }) =>
        $isActive
            ? ($isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)')
            : 'transparent'};
  border: 2px solid ${({ $isActive, $type, $isDark }) =>
        $isActive
            ? ($type === 'private' ? '#10b981' : $type === 'dealer' ? '#f59e0b' : '#3b82f6')
            : ($isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')};
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  ${({ $isActive }) => $isActive && css`
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
  `}

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ $type }) =>
        $type === 'private' ? '#10b981' : $type === 'dealer' ? '#f59e0b' : '#3b82f6'};
  }
`;

const Badge = styled.div<{ $type: 'private' | 'dealer' | 'company' }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background: ${({ $type }) =>
        $type === 'private' ? gradientPrivate :
            $type === 'dealer' ? gradientDealer : gradientCompany};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IconWrapper = styled.div<{ $type: 'private' | 'dealer' | 'company' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${({ $type }) =>
        $type === 'private' ? gradientPrivate :
            $type === 'dealer' ? gradientDealer : gradientCompany};
  margin-bottom: 4px;
`;

const CardTitle = styled.h3<{ $isDark?: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $isDark }) => $isDark ? '#f1f5f9' : '#1e293b'};
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureItem = styled.li<{ $isDark?: boolean; $negative?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  color: ${({ $isDark }) => $isDark ? '#cbd5e1' : '#475569'};

  svg {
    width: 16px;
    height: 16px;
    color: ${({ $negative }) => $negative ? '#ef4444' : '#10b981'};
    flex-shrink: 0;
  }
`;

const SelectButton = styled.button<{ $isActive: boolean; $type: 'private' | 'dealer' | 'company' }>`
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $isActive, $type }) =>
        $isActive
            ? ($type === 'private' ? '#10b981' : $type === 'dealer' ? '#f59e0b' : '#3b82f6')
            : 'rgba(148, 163, 184, 0.1)'};
  color: ${({ $isActive }) => $isActive ? 'white' : '#64748b'};

  &:hover {
    background: ${({ $isActive, $type }) =>
        $isActive
            ? ($type === 'private' ? '#059669' : $type === 'dealer' ? '#d97706' : '#2563eb')
            : 'rgba(148, 163, 184, 0.2)'};
    color: ${({ $isActive }) => $isActive ? 'white' : '#475569'};
  }
`;

const AlertBox = styled.div<{ $type: 'info' | 'warning' }>`
  margin-top: 24px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  background: ${({ $type }) => $type === 'info' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  border: 1px solid ${({ $type }) => $type === 'info' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
  color: ${({ $type }) => $type === 'info' ? '#2563eb' : '#d97706'};
  font-size: 0.9rem;
  line-height: 1.5;
`;

export const ProfileTypeSwitcher = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // In a real app, this would come from a theme context
    const isDark = false;

    // Current type (fallback to private)
    const currentType = (user?.profileType as 'private' | 'dealer' | 'company') || 'private';

    const handleTypeChange = async (newType: 'private' | 'dealer' | 'company') => {
        if (!user || isLoading || newType === currentType) return;

        try {
            setIsLoading(true);
            const userRef = doc(db, 'users', user.uid);

            // Set planTier based on type
            let planTier = 'free';
            if (newType === 'dealer') planTier = 'dealer';
            if (newType === 'company') planTier = 'company';

            await updateDoc(userRef, {
                profileType: newType,
                planTier: planTier,
                updatedAt: serverTimestamp()
            });

            toast.success(`Profile updated to ${newType.toUpperCase()}`);
            // Optimistic update handled by Firestore listener in AuthProvider usually
        } catch (error) {
            console.error('Failed to update profile type:', error);
            toast.error('Failed to update profile type');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container $isDark={isDark}>
            <Header>
                <Title $isDark={isDark}>
                    <Crown size={28} className="text-amber-500" />
                    <span>Account Tier</span>
                </Title>
            </Header>

            <Grid>
                {/* Private Tier */}
                <Card
                    $isActive={currentType === 'private'}
                    $type="private"
                    $isDark={isDark}
                    onClick={() => handleTypeChange('private')}
                >
                    {currentType === 'private' && <Badge $type="private">Active</Badge>}
                    <CardContent>
                        <IconWrapper $type="private">
                            <Briefcase size={24} />
                        </IconWrapper>
                        <CardTitle $isDark={isDark}>Private User</CardTitle>
                        <FeatureList>
                            <FeatureItem $isDark={isDark}>
                                <Check /> Max 3 Listings / Month
                            </FeatureItem>
                            <FeatureItem $isDark={isDark} $negative>
                                <X /> No Make/Model Changes
                            </FeatureItem>
                            <FeatureItem $isDark={isDark} $negative>
                                <X /> Basic Support
                            </FeatureItem>
                        </FeatureList>
                        <SelectButton $isActive={currentType === 'private'} $type="private">
                            {isLoading && currentType !== 'private' ? 'Updating...' : (currentType === 'private' ? 'Current Plan' : 'Switch to Private')}
                        </SelectButton>
                    </CardContent>
                </Card>

                {/* Dealer Tier */}
                <Card
                    $isActive={currentType === 'dealer'}
                    $type="dealer"
                    $isDark={isDark}
                    onClick={() => handleTypeChange('dealer')}
                >
                    {currentType === 'dealer' && <Badge $type="dealer">Active</Badge>}
                    <CardContent>
                        <IconWrapper $type="dealer">
                            <Shield size={24} />
                        </IconWrapper>
                        <CardTitle $isDark={isDark}>Dealer</CardTitle>
                        <FeatureList>
                            <FeatureItem $isDark={isDark}>
                                <Check /> Max 10 Listings / Month
                            </FeatureItem>
                            <FeatureItem $isDark={isDark}>
                                <Check /> 5 Make/Model Changes
                            </FeatureItem>
                            <FeatureItem $isDark={isDark}>
                                <Check /> Verified Badge
                            </FeatureItem>
                        </FeatureList>
                        <SelectButton $isActive={currentType === 'dealer'} $type="dealer">
                            {isLoading && currentType !== 'dealer' ? 'Updating...' : (currentType === 'dealer' ? 'Current Plan' : 'Switch to Dealer')}
                        </SelectButton>
                    </CardContent>
                </Card>

                {/* Company Tier */}
                <Card
                    $isActive={currentType === 'company'}
                    $type="company"
                    $isDark={isDark}
                    onClick={() => handleTypeChange('company')}
                >
                    {currentType === 'company' && <Badge $type="company">Active</Badge>}
                    <CardContent>
                        <IconWrapper $type="company">
                            <Building size={24} />
                        </IconWrapper>
                        <CardTitle $isDark={isDark}>Company</CardTitle>
                        <FeatureList>
                            <FeatureItem $isDark={isDark}>
                                <Check /> Max 100 Listings / Month
                            </FeatureItem>
                            <FeatureItem $isDark={isDark}>
                                <Check /> 25 Make/Model Changes
                            </FeatureItem>
                            <FeatureItem $isDark={isDark}>
                                <Check /> Priority Support
                            </FeatureItem>
                        </FeatureList>
                        <SelectButton $isActive={currentType === 'company'} $type="company">
                            {isLoading && currentType !== 'company' ? 'Updating...' : (currentType === 'company' ? 'Current Plan' : 'Switch to Company')}
                        </SelectButton>
                    </CardContent>
                </Card>
            </Grid>

            <AlertBox $type="info">
                <Info size={20} />
                <div>
                    <strong>Monthly Quota Policy:</strong> Listings quota resets on the 1st of every month.
                    Deleting listings does not restore your creation limit.
                    Make/Model changes are limited to prevent abuse.
                </div>
            </AlertBox>
        </Container>
    );
};
