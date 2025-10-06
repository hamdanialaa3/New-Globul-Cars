import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../../components/LazyImage';
import { useProfile } from './hooks/useProfile';
import { bulgarianAuthService } from '../../firebase';
import { 
  ProfileImageUploader, 
  CoverImageUploader, 
  TrustBadge,
  ProfileGallery,
  VerificationPanel,
  ProfileStats as ProfileStatsComponent,
  ProfileCompletion,
  IDReferenceHelper,
  BusinessUpgradeCard,
  BusinessBackground
} from '../../components/Profile';
import { 
  RefreshCw, 
  User, 
  Building2, 
  AlertCircle, 
  Car, 
  Phone, 
  Home, 
  Settings,
  UserCircle
} from 'lucide-react';
import * as S from './styles';
import styled from 'styled-components';

// Professional Icon Wrapper with shadow effects
const IconWrapper = styled.span<{ $color?: string; $size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || '#FF7900'};
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.2s ease;
  
  &:hover {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
    transform: translateY(-1px);
  }
  
  svg {
    width: ${props => props.$size || 18}px;
    height: ${props => props.$size || 18}px;
  }
`;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const {
    user,
    userCars,
    loading,
    editing,
    formData,
    handleInputChange,
    handleSaveProfile,
    handleCancelEdit,
    handleLogout,
    setEditing,
    setUser
  } = useProfile();

  // Track active field for ID helper
  const [activeField, setActiveField] = React.useState<string | undefined>(undefined);
  
  // Track account type switch warning
  const [showAccountTypeWarning, setShowAccountTypeWarning] = React.useState(false);
  
  // Handle account type change
  const handleAccountTypeChange = (newType: 'individual' | 'business') => {
    if (formData.accountType !== newType) {
      setShowAccountTypeWarning(true);
      setTimeout(() => setShowAccountTypeWarning(false), 5000);
    }
    handleInputChange({ 
      target: { name: 'accountType', value: newType } 
    } as React.ChangeEvent<HTMLInputElement>);
  };
  
  // Handle upgrade to business
  const handleUpgradeToBusiness = () => {
    setEditing(true);
    handleAccountTypeChange('business');
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <S.ProfileContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('common.loading')}
          </div>
        </S.PageContainer>
      </S.ProfileContainer>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <S.ProfileContainer>
        <S.PageContainer>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            {t('profile.notLoggedIn')}
          </div>
        </S.PageContainer>
      </S.ProfileContainer>
    );
  }

  const isBusinessMode = (user as any)?.accountType === 'business' || formData.accountType === 'business';

  return (
    <S.ProfileContainer $isBusinessMode={isBusinessMode}>
      {/* Business Background - Only for Business Accounts */}
      <BusinessBackground isBusinessAccount={isBusinessMode} />
      
      <S.PageContainer>
        {/* Cover Image */}
        <CoverImageUploader
          currentImageUrl={(user as any).coverImage?.url}
          onUploadSuccess={(url) => console.log('Cover uploaded:', url)}
          onUploadError={(error) => console.error('Cover error:', error)}
        />

        {/* Profile Grid */}
        <S.ProfileGrid>
          {/* Profile Sidebar */}
          <S.ProfileSidebar $isBusinessMode={isBusinessMode}>
            {/* Profile Image */}
            <div style={{ marginTop: '-80px', marginBottom: '20px' }}>
              <ProfileImageUploader
                currentImageUrl={(user as any).profileImage?.url}
                onUploadSuccess={(url) => console.log('Profile uploaded:', url)}
                onUploadError={(error) => console.error('Profile error:', error)}
              />
            </div>

            {/* User Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                {user.displayName || t('profile.anonymous')}
              </div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>
                {user.email}
              </div>
            </div>

            {/* Business Upgrade Card - Only for Individual Accounts */}
            {!editing && ((user as any)?.accountType === 'individual' || !((user as any)?.accountType)) && (
              <div style={{ marginBottom: '20px' }}>
                <BusinessUpgradeCard onUpgrade={handleUpgradeToBusiness} />
              </div>
            )}

            {/* Trust Badge */}
            <TrustBadge
              trustScore={(user as any).verification?.trustScore || 10}
              level={(user as any).verification?.level || 'unverified'}
              badges={(user as any).verification?.badges || []}
            />

            {/* Profile Completion */}
            <div style={{ marginTop: '20px' }}>
              <ProfileCompletion
                hasProfileImage={!!(user as any).profileImage}
                hasCoverImage={!!(user as any).coverImage}
                hasBio={!!user.bio}
                hasPhone={!!user.phoneNumber}
                hasLocation={!!user.location?.city}
                emailVerified={(user as any).verification?.email?.verified || false}
                phoneVerified={(user as any).verification?.phone?.verified || false}
                idVerified={(user as any).verification?.identity?.verified || false}
              />
            </div>

            {/* Actions */}
            <S.ProfileActions>
              <S.ActionButton onClick={() => setEditing(!editing)}>
                {editing ? t('profile.cancelEdit') : t('profile.editProfile')}
              </S.ActionButton>
              <S.ActionButton variant="secondary" onClick={() => window.location.href = '/sell-car'}>
                {t('profile.addCar')}
              </S.ActionButton>
              <S.ActionButton variant="secondary" onClick={() => window.location.href = '/messages'}>
                {t('profile.messages')}
              </S.ActionButton>
              <S.ActionButton variant="danger" onClick={handleLogout}>
                {t('profile.logout')}
              </S.ActionButton>
            </S.ProfileActions>
          </S.ProfileSidebar>

          {/* Profile Content */}
          <S.ProfileContent>
            {/* Statistics Overview */}
            <S.ContentSection $isBusinessMode={isBusinessMode}>
              <ProfileStatsComponent
                carsListed={(user as any).stats?.carsListed || 0}
                carsSold={(user as any).stats?.carsSold || 0}
                totalViews={(user as any).stats?.totalViews || 0}
                responseTime={(user as any).stats?.responseTime || 0}
                responseRate={(user as any).stats?.responseRate || 0}
                totalMessages={(user as any).stats?.totalMessages || 0}
              />
            </S.ContentSection>

            {/* Personal Information */}
            <S.ContentSection $isBusinessMode={isBusinessMode}>
              <S.SectionHeader>
                <h2>{t('profile.personalInfo')}</h2>
                {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    {t('profile.edit')}
                  </button>
                )}
              </S.SectionHeader>

              {editing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                  {/* Account Type Selector */}
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconWrapper $color="#666" $size={16}><RefreshCw /></IconWrapper>
                      {language === 'bg' ? 'Тип на акаунта' : 'Account Type'}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: showAccountTypeWarning ? '12px' : '0' }}>
                      <button
                        type="button"
                        onClick={() => handleAccountTypeChange('individual')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          border: `2px solid ${formData.accountType === 'individual' ? '#FF7900' : '#ddd'}`,
                          background: formData.accountType === 'individual' ? '#fff5e6' : 'white',
                          color: formData.accountType === 'individual' ? '#FF7900' : '#666',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <User size={18} />
                        {language === 'bg' ? 'Личен' : 'Individual'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAccountTypeChange('business')}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          border: `2px solid ${formData.accountType === 'business' ? '#FF7900' : '#ddd'}`,
                          background: formData.accountType === 'business' ? '#fff5e6' : 'white',
                          color: formData.accountType === 'business' ? '#FF7900' : '#666',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Building2 size={18} />
                        {language === 'bg' ? 'Бизнес' : 'Business'}
                      </button>
                    </div>
                    {showAccountTypeWarning && (
                      <div style={{ 
                        padding: '8px 12px', 
                        background: '#fff3cd', 
                        border: '1px solid #ffc107', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#856404',
                        animation: 'fadeIn 0.3s ease-in',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>
                          {language === 'bg' 
                            ? 'За бизнес акаунт трябва да предоставите валидна информация за фирмата съгласно българското законодателство.'
                            : 'For a business account, you must provide valid company information according to Bulgarian legislation.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Required Fields */}
                  <div style={{ marginBottom: '12px', padding: '10px', background: '#fff5e6', borderRadius: '6px', border: '2px solid #FF7900' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#FF7900', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                      <IconWrapper $color="#FF7900" $size={16}><AlertCircle /></IconWrapper>
                      {language === 'bg' ? 'Задължителни полета' : 'Required Fields'}
                    </h4>
                    
                    {formData.accountType === 'individual' ? (
                      <S.FormGrid>
                        <S.FormGroup>
                          <label style={{ color: '#FF7900', fontWeight: 'bold' }}>
                            {language === 'bg' ? 'Име' : 'First Name'} <span style={{ color: '#f44336' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('firstName')}
                            onBlur={() => setActiveField(undefined)}
                            placeholder="СЛАВИНА"
                            required
                            style={{ borderColor: '#FF7900', borderWidth: '2px' }}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label style={{ color: '#FF7900', fontWeight: 'bold' }}>
                            {language === 'bg' ? 'Фамилия' : 'Last Name'} <span style={{ color: '#f44336' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            onFocus={() => setActiveField('lastName')}
                            onBlur={() => setActiveField(undefined)}
                            placeholder="ИВАНОВА"
                            required
                            style={{ borderColor: '#FF7900', borderWidth: '2px' }}
                          />
                        </S.FormGroup>
                      </S.FormGrid>
                    ) : (
                      <S.FormGroup>
                        <label style={{ color: '#FF7900', fontWeight: 'bold' }}>
                          {language === 'bg' ? 'Име на фирмата' : 'Business Name'} <span style={{ color: '#f44336' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' ? 'Автомобили България ЕООД' : 'Cars Bulgaria Ltd'}
                          required
                          style={{ borderColor: '#FF7900', borderWidth: '2px' }}
                        />
                      </S.FormGroup>
                    )}
                  </div>

                  {/* Business Information - Only for Business Accounts */}
                  {formData.accountType === 'business' && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconWrapper $color="#666" $size={14}><Building2 /></IconWrapper>
                        {language === 'bg' ? 'Информация за фирмата' : 'Business Information'}
                      </h4>
                      <S.FormGrid>
                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Тип на бизнеса' : 'Business Type'} <span style={{ color: '#f44336' }}>*</span></label>
                          <select 
                            name="businessType" 
                            value={formData.businessType} 
                            onChange={handleInputChange}
                            required
                            style={{ borderColor: '#FF7900' }}
                          >
                            <option value="dealership">🚗 {language === 'bg' ? 'Автосалон / Дилър' : 'Car Dealership'}</option>
                            <option value="trader">🤝 {language === 'bg' ? 'Търговец' : 'Trader'}</option>
                            <option value="company">🏭 {language === 'bg' ? 'Компания' : 'Company'}</option>
                          </select>
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'БУЛСТАТ / ЕИК' : 'Bulstat / UIC'}</label>
                          <input
                            type="text"
                            name="bulstat"
                            value={formData.bulstat}
                            onChange={handleInputChange}
                            placeholder="123456789"
                            maxLength={13}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'ДДС номер' : 'VAT Number'}</label>
                          <input
                            type="text"
                            name="vatNumber"
                            value={formData.vatNumber}
                            onChange={handleInputChange}
                            placeholder="BG123456789"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Търговски регистър' : 'Registration Number'}</label>
                          <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            placeholder="20XXXXXXXX"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Уебсайт' : 'Website'}</label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Телефон на фирмата' : 'Business Phone'}</label>
                          <input
                            type="tel"
                            name="businessPhone"
                            value={formData.businessPhone}
                            onChange={handleInputChange}
                            placeholder="+359 2 XXX XXXX"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Имейл на фирмата' : 'Business Email'}</label>
                          <input
                            type="email"
                            name="businessEmail"
                            value={formData.businessEmail}
                            onChange={handleInputChange}
                            placeholder="info@company.bg"
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Работно време' : 'Working Hours'}</label>
                          <input
                            type="text"
                            name="workingHours"
                            value={formData.workingHours}
                            onChange={handleInputChange}
                            placeholder={language === 'bg' ? 'Пон-Пет: 9:00-18:00' : 'Mon-Fri: 9:00-18:00'}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Град' : 'City'}</label>
                          <input
                            type="text"
                            name="businessCity"
                            value={formData.businessCity}
                            onChange={handleInputChange}
                            placeholder={language === 'bg' ? 'София' : 'Sofia'}
                          />
                        </S.FormGroup>

                        <S.FormGroup>
                          <label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</label>
                          <input
                            type="text"
                            name="businessPostalCode"
                            value={formData.businessPostalCode}
                            onChange={handleInputChange}
                            placeholder="1000"
                          />
                        </S.FormGroup>
                      </S.FormGrid>

                      <S.FormGroup style={{ marginTop: '8px' }}>
                        <label>{language === 'bg' ? 'Адрес на фирмата' : 'Business Address'}</label>
                        <input
                          type="text"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' ? 'бул. Цариградско шосе 100' : 'Tsarigradsko Shose Blvd 100'}
                        />
                      </S.FormGroup>

                      <S.FormGroup style={{ marginTop: '8px' }}>
                        <label>{language === 'bg' ? 'Описание на бизнеса' : 'Business Description'}</label>
                        <textarea
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleInputChange}
                          placeholder={language === 'bg' 
                            ? 'Опишете вашия бизнес, услуги и специализация...'
                            : 'Describe your business, services and specialization...'}
                          rows={3}
                        />
                      </S.FormGroup>
                    </div>
                  )}

                  {/* Personal Information from ID - Only for Individual */}
                  {formData.accountType === 'individual' && (
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><UserCircle /></IconWrapper>
                      {language === 'bg' ? 'Лична информация (от лична карта)' : 'Personal Information (from ID card)'}
                    </h4>
                  <S.FormGrid>
                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Презиме (Бащино име)' : 'Middle Name (Father\'s Name)'}</label>
                      <input
                        type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('middleName')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="ГЕОРГИЕВА"
                        />
                      </S.FormGroup>

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                        onChange={handleInputChange}
                          onFocus={() => setActiveField('dateOfBirth')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="01.08.1995"
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Място на раждане' : 'Place of Birth'}</label>
                        <input
                          type="text"
                          name="placeOfBirth"
                          value={formData.placeOfBirth}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('birthPlace')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="СОФИЯ/SOFIA"
                        />
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>
                  )}

                  {/* Contact Information */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Phone /></IconWrapper>
                      {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Телефон' : 'Phone Number'}</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+359 88 123 4567"
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                        <label>{language === 'bg' ? 'Имейл' : 'Email'}</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@email.com"
                          disabled
                          style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
                        />
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>

                  {/* Address Information */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Град' : 'City'}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                          onFocus={() => setActiveField('city')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="СОФИЯ/SOFIA"
                      />
                    </S.FormGroup>

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      </S.FormGroup>
                    </S.FormGrid>

                    <S.FormGroup>
                      <label>{language === 'bg' ? 'Постоянен адрес' : 'Permanent Address'}</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField('address')}
                        onBlur={() => setActiveField(undefined)}
                        placeholder="бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 ет.5 ап.26"
                      />
                    </S.FormGroup>
                  </div>

                  {/* Other */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Settings /></IconWrapper>
                      {language === 'bg' ? 'Други настройки' : 'Other Settings'}
                    </h4>
                    <S.FormGroup>
                      <label>{language === 'bg' ? 'Предпочитан език' : 'Preferred Language'}</label>
                      <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange}>
                        <option value="bg">🇧🇬 {t('languages.bulgarian')}</option>
                        <option value="en">🇬🇧 {t('languages.english')}</option>
                      </select>
                    </S.FormGroup>
                  </div>

                  <S.FormGroup>
                    <label>{t('profile.bio')}</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder={t('profile.bioPlaceholder')}
                      rows={4}
                    />
                  </S.FormGroup>

                  <S.FormActions>
                    <S.CancelButton type="button" onClick={handleCancelEdit}>
                      {t('common.cancel')}
                    </S.CancelButton>
                    <S.SaveButton type="submit">
                      {t('profile.saveChanges')}
                    </S.SaveButton>
                  </S.FormActions>
                </form>
              ) : (
                <div>
                  {/* Personal Info */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', paddingBottom: '5px', borderBottom: '1px solid #e0e0e0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><UserCircle /></IconWrapper>
                      {language === 'bg' ? 'Лична информация' : 'Personal Information'}
                    </h4>
                  <S.FormGrid>
                    <div>
                        <strong>{language === 'bg' ? 'Име' : 'First Name'}:</strong> {(user as any).firstName || t('profile.notSet')}
                      </div>
                      <div>
                        <strong>{language === 'bg' ? 'Презиме' : 'Middle Name'}:</strong> {(user as any).middleName || t('profile.notSet')}
                      </div>
                      <div>
                        <strong>{language === 'bg' ? 'Фамилия' : 'Last Name'}:</strong> {(user as any).lastName || t('profile.notSet')}
                    </div>
                    <div>
                        <strong>{language === 'bg' ? 'Дата на раждане' : 'Date of Birth'}:</strong> {
                          (user as any).dateOfBirth ? new Date((user as any).dateOfBirth).toLocaleDateString('bg-BG') : t('profile.notSet')
                        }
                    </div>
                    <div>
                        <strong>{language === 'bg' ? 'Място на раждане' : 'Place of Birth'}:</strong> {(user as any).placeOfBirth || t('profile.notSet')}
                      </div>
                    </S.FormGrid>
                  </div>


                  {/* Contact */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', paddingBottom: '5px', borderBottom: '1px solid #e0e0e0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Phone /></IconWrapper>
                      {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
                    </h4>
                    <S.FormGrid>
                      <div>
                        <strong>{language === 'bg' ? 'Телефон' : 'Phone'}:</strong> {user.phoneNumber || t('profile.notSet')}
                    </div>
                    <div>
                        <strong>{language === 'bg' ? 'Имейл' : 'Email'}:</strong> {user.email || t('profile.notSet')}
                      </div>
                    </S.FormGrid>
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', paddingBottom: '5px', borderBottom: '1px solid #e0e0e0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Home /></IconWrapper>
                      {language === 'bg' ? 'Адресна информация' : 'Address Information'}
                    </h4>
                    <S.FormGrid>
                      <div>
                        <strong>{language === 'bg' ? 'Град' : 'City'}:</strong> {user.location?.city || t('profile.notSet')}
                    </div>
                      <div>
                        <strong>{language === 'bg' ? 'Пощенски код' : 'Postal Code'}:</strong> {(user as any).postalCode || t('profile.notSet')}
                      </div>
                    </S.FormGrid>
                    {(user as any).address && (
                      <div style={{ marginTop: '12px' }}>
                        <strong>{language === 'bg' ? 'Адрес' : 'Address'}:</strong>
                        <div style={{ marginTop: '4px', color: '#666' }}>{(user as any).address}</div>
                      </div>
                    )}
                  </div>

                  {/* Other */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', paddingBottom: '5px', borderBottom: '1px solid #e0e0e0', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconWrapper $color="#666" $size={14}><Settings /></IconWrapper>
                      {language === 'bg' ? 'Други' : 'Other'}
                    </h4>
                    <S.FormGrid>
                    <div>
                      <strong>{t('profile.preferredLanguage')}:</strong> {
                          user.preferredLanguage === 'bg' ? '🇧🇬 ' + t('languages.bulgarian') : '🇬🇧 ' + t('languages.english')
                      }
                    </div>
                    <div>
                      <strong>{t('profile.memberSince')}:</strong> {
                          user.createdAt ? new Date(user.createdAt).toLocaleDateString('bg-BG') : t('profile.notSet')
                      }
                    </div>
                  </S.FormGrid>
                  </div>

                  {user.bio && (
                    <div style={{ marginTop: '2rem' }}>
                      <strong>{t('profile.bio')}:</strong>
                      <p style={{ marginTop: '0.5rem', color: '#666' }}>{user.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </S.ContentSection>

            {/* Verification Panel */}
            <S.ContentSection>
              <VerificationPanel
                emailVerified={user.emailVerified || (user as any).verification?.email?.verified || false}
                phoneVerified={(user as any).verification?.phone?.verified || false}
                idVerified={(user as any).verification?.identity?.verified || false}
                businessVerified={(user as any).verification?.business?.verified || false}
              />
            </S.ContentSection>

            {/* Photo Gallery */}
            <S.ContentSection>
              <ProfileGallery
                userId={user.uid}
                images={(user as any).gallery || []}
                maxImages={9}
                onUpdate={async (images) => {
                  try {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const { db } = await import('../../firebase/firebase-config');
                    await updateDoc(doc(db, 'users', user.uid), {
                      gallery: images
                    });
                    // Update local user state
                    setUser(prev => prev ? { ...prev, gallery: images } as any : null);
                    console.log('✅ Gallery updated and saved');
                  } catch (error) {
                    console.error('❌ Failed to save gallery:', error);
                  }
                }}
              />
            </S.ContentSection>

            {/* My Cars */}
            <S.ContentSection>
              <S.SectionHeader>
                <h2>{t('profile.myCars')}</h2>
                <button className="edit-btn" onClick={() => window.location.href = '/sell-car'}>
                  {t('profile.addCar')}
                </button>
              </S.SectionHeader>

              {userCars.length > 0 ? (
                <S.CarsList>
                  {userCars.map((car) => (
                    <S.CarCard key={car.id}>
                      <div className="car-image">
                        {car.mainImage ? (
                          <LazyImage
                            src={car.mainImage}
                            alt={car.title}
                            placeholder="🚗"
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            color: '#ccc'
                          }}>
                            🚗
                          </div>
                        )}
                      </div>
                      <div className="car-title">{car.title}</div>
                      <div className="car-price">€{car.price.toLocaleString()}</div>
                      <div className="car-details">
                        {car.year} • {car.mileage?.toLocaleString()} km • {car.fuelType}
                      </div>
                      <div className="car-actions">
                        <button
                          className="action-btn"
                          onClick={() => window.location.href = `/cars/${car.id}`}
                        >
                          {t('profile.view')}
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => window.location.href = `/cars/${car.id}/edit`}
                        >
                          {t('profile.edit')}
                        </button>
                      </div>
                    </S.CarCard>
                  ))}
                </S.CarsList>
              ) : (
                <S.EmptyState>
                          <span className="empty-icon">
                            <IconWrapper $color="#ccc" $size={64}><Car /></IconWrapper>
                          </span>
                  <div className="empty-title">{t('profile.noCars')}</div>
                  <div className="empty-description">{t('profile.noCarsDescription')}</div>
                  <button
                    className="edit-btn"
                    onClick={() => window.location.href = '/sell-car'}
                    style={{ margin: '0 auto' }}
                  >
                    {t('profile.addFirstCar')}
                  </button>
                </S.EmptyState>
              )}
            </S.ContentSection>
          </S.ProfileContent>
        </S.ProfileGrid>

        {/* ID Reference Helper - shows when editing & individual account */}
        {editing && ((user as any)?.accountType !== 'business' && formData.accountType === 'individual') && (
          <IDReferenceHelper 
            activeField={activeField}
          />
        )}
      </S.PageContainer>
    </S.ProfileContainer>
  );
};

export default ProfilePage;