import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
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
                  <S.FormGrid>
                    <S.FormGroup>
                      <label>{t('profile.displayName')}</label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField('firstName')}
                        onBlur={() => setActiveField(undefined)}
                        placeholder={t('profile.displayNamePlaceholder')}
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                      <label>{t('profile.phoneNumber')}</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+359 88 123 4567"
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                      <label>{t('profile.city')}</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField('city')}
                        onBlur={() => setActiveField(undefined)}
                        placeholder={t('profile.cityPlaceholder')}
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                      <label>{t('profile.region')}</label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        onFocus={() => setActiveField('address')}
                        onBlur={() => setActiveField(undefined)}
                        placeholder={t('profile.regionPlaceholder')}
                      />
                    </S.FormGroup>

                    <S.FormGroup>
                      <label>{t('profile.preferredLanguage')}</label>
                      <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange}>
                        <option value="bg">{t('languages.bulgarian')}</option>
                        <option value="en">{t('languages.english')}</option>
                      </select>
                    </S.FormGroup>
                  </S.FormGrid>

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
                  <S.FormGrid>
                    <div>
                      <strong>{t('profile.displayName')}:</strong> {user.displayName || t('profile.notSet')}
                    </div>
                    <div>
                      <strong>{t('profile.phoneNumber')}:</strong> {user.phoneNumber || t('profile.notSet')}
                    </div>
                    <div>
                      <strong>{t('profile.city')}:</strong> {user.location?.city || t('profile.notSet')}
                    </div>
                    <div>
                      <strong>{t('profile.region')}:</strong> {user.location?.region || t('profile.notSet')}
                    </div>
                    <div>
                      <strong>{t('profile.preferredLanguage')}:</strong> {
                        user.preferredLanguage === 'bg' ? t('languages.bulgarian') : t('languages.english')
                      }
                    </div>
                    <div>
                      <strong>{t('profile.memberSince')}:</strong> {
                        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : t('profile.notSet')
                      }
                    </div>
                  </S.FormGrid>

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