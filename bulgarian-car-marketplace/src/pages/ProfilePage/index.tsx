import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import LazyImage from '../../components/LazyImage';
import { useProfile } from './hooks/useProfile';
import { 
  ProfileImageUploader, 
  CoverImageUploader, 
  TrustBadge,
  ProfileGallery,
  VerificationPanel,
  ProfileStats as ProfileStatsComponent,
  ProfileCompletion,
  IDReferenceHelper
} from '../../components/Profile';
import * as S from './styles';

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
  } = useProfile();

  // Track active field for ID helper
  const [activeField, setActiveField] = React.useState<string | undefined>(undefined);

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

  return (
    <S.ProfileContainer>
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
          <S.ProfileSidebar>
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
            <S.ContentSection>
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
            <S.ContentSection>
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
                  {/* Required Fields */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: '#fff5e6', borderRadius: '8px', border: '2px solid #FF7900' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#FF7900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚠️ {language === 'bg' ? 'Задължителни полета' : 'Required Fields'}
                    </h4>
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
                  </div>

                  {/* Personal Information from ID */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#666', fontSize: '1rem' }}>
                      👤 {language === 'bg' ? 'Лична информация (от лична карта)' : 'Personal Information (from ID card)'}
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

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Гражданство' : 'Nationality'}</label>
                        <select 
                          name="nationality" 
                          value={formData.nationality} 
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('nationality')}
                          onBlur={() => setActiveField(undefined)}
                        >
                          <option value="BG">🇧🇬 БЪЛГАРИЯ / Bulgaria</option>
                          <option value="OTHER">{language === 'bg' ? 'Друго' : 'Other'}</option>
                        </select>
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>

                  {/* Physical Characteristics */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#666', fontSize: '1rem' }}>
                      📏 {language === 'bg' ? 'Физически характеристики' : 'Physical Characteristics'}
                    </h4>
                    <S.FormGrid>
                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Ръст (cm)' : 'Height (cm)'}</label>
                        <input
                          type="number"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('height')}
                          onBlur={() => setActiveField(undefined)}
                          placeholder="168"
                          min="100"
                          max="250"
                        />
                      </S.FormGroup>

                      <S.FormGroup>
                        <label>{language === 'bg' ? 'Цвят на очите' : 'Eye Color'}</label>
                        <select
                          name="eyeColor"
                          value={formData.eyeColor}
                          onChange={handleInputChange}
                          onFocus={() => setActiveField('eyeColor')}
                          onBlur={() => setActiveField(undefined)}
                        >
                          <option value="">--</option>
                          <option value="BROWN">🟤 {language === 'bg' ? 'КАФЯВИ' : 'BROWN'}</option>
                          <option value="BLUE">🔵 {language === 'bg' ? 'СИНИ' : 'BLUE'}</option>
                          <option value="GREEN">🟢 {language === 'bg' ? 'ЗЕЛЕНИ' : 'GREEN'}</option>
                          <option value="GREY">⚪ {language === 'bg' ? 'СИВИ' : 'GREY'}</option>
                          <option value="HAZEL">🟠 {language === 'bg' ? 'ЛЕША' : 'HAZEL'}</option>
                        </select>
                      </S.FormGroup>
                    </S.FormGrid>
                  </div>

                  {/* Contact Information */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#666', fontSize: '1rem' }}>
                      📞 {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
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
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#666', fontSize: '1rem' }}>
                      🏠 {language === 'bg' ? 'Адресна информация' : 'Address Information'}
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
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#666', fontSize: '1rem' }}>
                      ⚙️ {language === 'bg' ? 'Други настройки' : 'Other Settings'}
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
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' }}>
                      👤 {language === 'bg' ? 'Лична информация' : 'Personal Information'}
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
                      <div>
                        <strong>{language === 'bg' ? 'Гражданство' : 'Nationality'}:</strong> {
                          (user as any).nationality === 'BG' ? '🇧🇬 БЪЛГАРИЯ' : ((user as any).nationality || t('profile.notSet'))
                        }
                      </div>
                    </S.FormGrid>
                  </div>

                  {/* Physical */}
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' }}>
                      📏 {language === 'bg' ? 'Физически характеристики' : 'Physical Characteristics'}
                    </h4>
                    <S.FormGrid>
                      <div>
                        <strong>{language === 'bg' ? 'Ръст' : 'Height'}:</strong> {(user as any).height ? `${(user as any).height} cm` : t('profile.notSet')}
                      </div>
                      <div>
                        <strong>{language === 'bg' ? 'Цвят на очите' : 'Eye Color'}:</strong> {(user as any).eyeColor || t('profile.notSet')}
                      </div>
                    </S.FormGrid>
                  </div>

                  {/* Contact */}
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' }}>
                      📞 {language === 'bg' ? 'Контактна информация' : 'Contact Information'}
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
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' }}>
                      🏠 {language === 'bg' ? 'Адресна информация' : 'Address Information'}
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
                    <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' }}>
                      ⚙️ {language === 'bg' ? 'Други' : 'Other'}
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
                emailVerified={(user as any).verification?.email?.verified || false}
                phoneVerified={(user as any).verification?.phone?.verified || false}
                idVerified={(user as any).verification?.identity?.verified || false}
                businessVerified={(user as any).verification?.business?.verified || false}
                onVerifyClick={(type) => console.log('Verify:', type)}
              />
            </S.ContentSection>

            {/* Photo Gallery */}
            <S.ContentSection>
              <ProfileGallery
                userId={user.uid}
                images={(user as any).gallery || []}
                maxImages={9}
                onUpdate={(images) => console.log('Gallery updated:', images)}
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
                  <span className="empty-icon">🚗</span>
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

        {/* ID Reference Helper - shows when editing */}
        {editing && (
          <IDReferenceHelper 
            activeField={activeField}
          />
        )}
      </S.PageContainer>
    </S.ProfileContainer>
  );
};

export default ProfilePage;