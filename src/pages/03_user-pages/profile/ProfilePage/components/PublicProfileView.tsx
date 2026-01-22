import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useToast } from '../../../../../components/Toast';
import { FacebookStyleHeader } from './FacebookStyleHeader';
import { AboutSection } from './AboutSection';
import { CarsGridSection } from './CarsGridSection';
import { ReviewsSection } from './ReviewsSection';
import { followService } from '../../../../../services/social/follow.service';
import { bulgarianAuthService } from '../../../../../services/auth/bulgarian-auth.service';
import { logger } from '../../../../../services/logger-service';
import * as S from '../styles/public-profile.styles';

interface PublicProfileViewProps {
    user: any;
    profileType: 'company' | 'dealer' | 'personal';
    userCars: any[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
    user,
    profileType,
    userCars,
}) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const toast = useToast();

    const [activeTab, setActiveTab] = useState<'about' | 'cars' | 'reviews'>('cars');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(user?.stats?.followers || 0);
    const [followingCount] = useState(user?.stats?.following || 0);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const checkFollowStatus = async () => {
            const currentUser = await bulgarianAuthService.getCurrentUserProfile();
            if (currentUser && user?.uid) {
                const following = await followService.isFollowing(currentUser.uid, user.uid);
                setIsFollowing(following);
            }
        };
        checkFollowStatus();
    }, [user?.uid]);

    const handleFollowToggle = async () => {
        if (followLoading) return;

        const currentUser = await bulgarianAuthService.getCurrentUserProfile();
        if (!currentUser) {
            toast.error(language === 'bg' ? 'Моля влезте' : 'Please sign in');
            navigate('/login');
            return;
        }

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await followService.unfollowUser(currentUser.uid, user.uid);
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
                toast.success(language === 'bg' ? 'Отписахте се' : 'Unfollowed');
            } else {
                await followService.followUser(currentUser.uid, user.uid);
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
                toast.success(language === 'bg' ? 'Последвахте' : 'Following');
            }
        } catch (error) {
            logger.error('Follow error', error as Error);
            toast.error(language === 'bg' ? 'Грешка' : 'Error');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMessageClick = () => {
        if (!user?.numericId) {
            toast.error(language === 'bg' ? 'Грешка' : 'Error');
            return;
        }
        navigate(`/messages/${user.numericId}`);
    };

    const activeCars = userCars.filter((car: any) =>
        car.status === 'active' && !car.isDraft && !car.isSold
    );

    return (
        <S.PublicProfileContainer $profileType={profileType}>
            <FacebookStyleHeader
                user={user}
                profileType={profileType}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
                onMessageClick={handleMessageClick}
                followersCount={followersCount}
                followingCount={followingCount}
                trustScore={user?.verification?.trustScore || 0}
            />

            <S.ContentContainer>
                <S.TabNavigation>
                    <S.TabButton
                        $active={activeTab === 'about'}
                        $profileType={profileType}
                        onClick={() => setActiveTab('about')}
                    >
                        {language === 'bg' ? 'За мен' : 'About'}
                    </S.TabButton>
                    <S.TabButton
                        $active={activeTab === 'cars'}
                        $profileType={profileType}
                        onClick={() => setActiveTab('cars')}
                    >
                        {language === 'bg' ? 'Автомобили' : 'Vehicles'}
                    </S.TabButton>
                    <S.TabButton
                        $active={activeTab === 'reviews'}
                        $profileType={profileType}
                        onClick={() => setActiveTab('reviews')}
                    >
                        {language === 'bg' ? 'Отзиви' : 'Reviews'}
                    </S.TabButton>
                </S.TabNavigation>

                <S.MainContentGrid>
                    <S.MainColumn>
                        {activeTab === 'about' && (
                            <AboutSection user={user} profileType={profileType} />
                        )}

                        {activeTab === 'cars' && (
                            <CarsGridSection
                                cars={activeCars}
                                profileType={profileType}
                                sellerNumericId={user.numericId}
                            />
                        )}

                        {activeTab === 'reviews' && (
                            <ReviewsSection
                                reviews={user.reviews || []}
                                profileType={profileType}
                                averageRating={user.averageRating || 0}
                                totalReviews={user.totalReviews || 0}
                            />
                        )}
                    </S.MainColumn>

                    <S.SidebarColumn>
                        {activeTab !== 'about' && (
                            <AboutSection user={user} profileType={profileType} />
                        )}
                    </S.SidebarColumn>
                </S.MainContentGrid>
            </S.ContentContainer>
        </S.PublicProfileContainer>
    );
};
