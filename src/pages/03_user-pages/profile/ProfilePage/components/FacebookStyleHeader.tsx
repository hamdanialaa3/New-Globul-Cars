import React from 'react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import * as S from '../styles/public-profile.styles';

interface FacebookStyleHeaderProps {
    user: any;
    profileType: 'company' | 'dealer' | 'personal';
    isFollowing: boolean;
    onFollowToggle: () => void;
    onMessageClick: () => void;
    followersCount: number;
    followingCount: number;
    trustScore: number;
}

export const FacebookStyleHeader: React.FC<FacebookStyleHeaderProps> = ({
    user,
    profileType,
    isFollowing,
    onFollowToggle,
    onMessageClick,
    followersCount,
    followingCount,
    trustScore,
}) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: user.displayName || user.firstName,
                    text: language === 'bg' ? 'Вижте този профил' : 'Check out this profile',
                    url: url,
                });
            } catch (err) {
                // Share cancelled by user
            }
        } else {
            navigator.clipboard.writeText(url);
            toast.success(language === 'bg' ? 'Линкът е копиран!' : 'Link copied!');
        }
    };

    const getCoverImage = () => {
        if (user?.coverImage?.url) return user.coverImage.url;

        if (profileType === 'company') {
            return '/images/covers/company-default.jpg';
        } else if (profileType === 'dealer') {
            return '/images/covers/dealer-default.jpg';
        }
        return '/images/covers/personal-default.jpg';
    };

    const getProfileImage = () => {
        if (user?.profileImage?.url) return user.profileImage.url;
        return '/images/default-avatar.png';
    };

    return (
        <>
            <S.CoverPhotoSection>
                <S.CoverImage
                    src={getCoverImage()}
                    alt="Cover"
                    onError={(e) => {
                        const img = e.currentTarget;
                        if (!img.dataset.errorHandled) {
                            img.dataset.errorHandled = 'true';
                            img.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=400&fit=crop';
                        }
                    }}
                />
                <S.CoverOverlay />
                <S.ProfilePictureWrapper>
                    <S.ProfilePicture
                        src={getProfileImage()}
                        alt={user.displayName}
                        $profileType={profileType}
                        onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.errorHandled) {
                                img.dataset.errorHandled = 'true';
                                img.src = '/assets/images/default-avatar.svg';
                            }
                        }}
                    />
                </S.ProfilePictureWrapper>
            </S.CoverPhotoSection>

            <S.ContentContainer>
                <S.HeaderInfoSection>
                    <S.ProfileName>
                        {user.displayName || user.firstName || (language === 'bg' ? 'Потребител' : 'User')}
                        {user.verification?.emailVerified && (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="#3b82f6">
                                <path d="M10 0L12.39 7.26L20 7.26L13.82 11.77L16.18 19.02L10 14.77L3.82 19.02L6.18 11.77L0 7.26L7.61 7.26L10 0Z" />
                            </svg>
                        )}
                    </S.ProfileName>

                    {user.bio && <S.ProfileBio>{user.bio}</S.ProfileBio>}

                    <S.StatsRow>
                        <S.StatItem>
                            <span className="stat-number">{followersCount}</span>
                            <span className="stat-label">
                                {language === 'bg' ? 'Последователи' : 'Followers'}
                            </span>
                        </S.StatItem>
                        <S.StatItem>
                            <span className="stat-number">{followingCount}</span>
                            <span className="stat-label">
                                {language === 'bg' ? 'Следва' : 'Following'}
                            </span>
                        </S.StatItem>
                        <S.StatItem>
                            <span className="stat-number">{trustScore}%</span>
                            <span className="stat-label">
                                {language === 'bg' ? 'Доверие' : 'Trust Score'}
                            </span>
                        </S.StatItem>
                    </S.StatsRow>

                    <S.ActionButtonsRow>
                        <S.ActionButton
                            $variant={isFollowing ? 'outline' : 'primary'}
                            onClick={onFollowToggle}
                        >
                            {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                            {isFollowing
                                ? (language === 'bg' ? 'Следвате' : 'Following')
                                : (language === 'bg' ? 'Последвай' : 'Follow')
                            }
                        </S.ActionButton>

                        <S.ActionButton
                            $variant="secondary"
                            onClick={onMessageClick}
                        >
                            <MessageCircle size={18} />
                            {language === 'bg' ? 'Съобщение' : 'Message'}
                        </S.ActionButton>

                        <S.ActionButton onClick={handleShare}>
                            <Share2 size={18} />
                            {language === 'bg' ? 'Сподели' : 'Share'}
                        </S.ActionButton>

                        <S.ActionButton>
                            <MoreHorizontal size={18} />
                        </S.ActionButton>
                    </S.ActionButtonsRow>
                </S.HeaderInfoSection>
            </S.ContentContainer>
        </>
    );
};
