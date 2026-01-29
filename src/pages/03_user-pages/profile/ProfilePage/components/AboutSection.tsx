import React from 'react';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { MapPin, Phone, Mail, Globe, Calendar, Briefcase, Building2 } from 'lucide-react';
import * as S from '../styles/public-profile.styles';

interface AboutSectionProps {
    user: any;
    profileType: 'company' | 'dealer' | 'personal';
}

export const AboutSection: React.FC<AboutSectionProps> = ({ user, profileType }) => {
    const { language } = useLanguage();

    const formatDate = (date: any) => {
        if (!date) return null;
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

    return (
        <S.SectionCard $profileType={profileType}>
            <S.SectionTitle>
                {language === 'bg' ? 'За мен' : 'About'}
            </S.SectionTitle>

            <S.SectionContent>
                {user.bio && (
                    <p style={{ marginBottom: '20px', lineHeight: '1.7' }}>
                        {user.bio}
                    </p>
                )}

                {profileType === 'company' && user.company && (
                    <>
                        <S.InfoRow>
                            <Building2 className="icon" size={20} />
                            <div className="content">
                                <div className="label">
                                    {language === 'bg' ? 'Компания' : 'Company'}
                                </div>
                                {user.company.name}
                            </div>
                        </S.InfoRow>

                        {user.company.registrationNumber && (
                            <S.InfoRow>
                                <Briefcase className="icon" size={20} />
                                <div className="content">
                                    <div className="label">
                                        {language === 'bg' ? 'Рег. номер' : 'Registration Number'}
                                    </div>
                                    {user.company.registrationNumber}
                                </div>
                            </S.InfoRow>
                        )}
                    </>
                )}

                {user.location && (
                    <S.InfoRow>
                        <MapPin className="icon" size={20} />
                        <div className="content">
                            <div className="label">
                                {language === 'bg' ? 'Местоположение' : 'Location'}
                            </div>
                            {user.location.city}, {user.location.region}
                        </div>
                    </S.InfoRow>
                )}

                {user.phone && (
                    <S.InfoRow>
                        <Phone className="icon" size={20} />
                        <div className="content">
                            <div className="label">
                                {language === 'bg' ? 'Телефон' : 'Phone'}
                            </div>
                            <a href={`tel:${user.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                                {user.phone}
                            </a>
                        </div>
                    </S.InfoRow>
                )}

                {user.email && (
                    <S.InfoRow>
                        <Mail className="icon" size={20} />
                        <div className="content">
                            <div className="label">
                                {language === 'bg' ? 'Имейл' : 'Email'}
                            </div>
                            <a href={`mailto:${user.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                                {user.email}
                            </a>
                        </div>
                    </S.InfoRow>
                )}

                {user.website && (
                    <S.InfoRow>
                        <Globe className="icon" size={20} />
                        <div className="content">
                            <div className="label">
                                {language === 'bg' ? 'Уебсайт' : 'Website'}
                            </div>
                            <a
                                href={user.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3b82f6', textDecoration: 'none' }}
                            >
                                {user.website}
                            </a>
                        </div>
                    </S.InfoRow>
                )}

                {user.createdAt && (
                    <S.InfoRow>
                        <Calendar className="icon" size={20} />
                        <div className="content">
                            <div className="label">
                                {language === 'bg' ? 'Член от' : 'Member since'}
                            </div>
                            {formatDate(user.createdAt)}
                        </div>
                    </S.InfoRow>
                )}
            </S.SectionContent>
        </S.SectionCard>
    );
};
