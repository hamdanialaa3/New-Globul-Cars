import React, { useState } from 'react';
import { useTranslation } from '../../../../../hooks/useTranslation';
import {
  SectionCard,
  SectionHeader,
  SectionContent,
  SectionBody,
  SectionTitle,
  ExpandIcon,
  FormGrid,
  FormGroup,
  SearchInput,
  SearchSelect,
  RangeGroup
} from '../styles';
import { SearchData } from '../types';
import { useLanguage } from '../../../../../contexts/LanguageContext';

// Premium/Top brands (mobile.de style - most searched in Europe)
const TOP_BRANDS = [
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volkswagen',
  'Porsche',
  'Ford',
  'Skoda',
  'Opel',
  'Toyota',
  'Volvo'
];

interface BasicDataSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  carMakes: string[];
}

export const BasicDataSection: React.FC<BasicDataSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange,
  carMakes
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showOtherMake, setShowOtherMake] = useState(false);
  const [showOtherVehicleType, setShowOtherVehicleType] = useState(false);

  return (
    <SectionCard>
      <SectionHeader $isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
        <ExpandIcon $isOpen={isOpen} />
      </SectionHeader>
      <SectionContent $isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.make')}</label>
              <SearchSelect 
                name="make" 
                value={showOtherMake ? '__OTHER__' : searchData.make} 
                onChange={(e) => {
                  if (e.target.value === '__OTHER__') {
                    setShowOtherMake(true);
                    const event = { target: { name: 'make', value: '' } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  } else {
                    setShowOtherMake(false);
                    onChange(e);
                  }
                }}
              >
                <option value="">{t('advancedSearch.all')}</option>
                
                {/* Top Brands Section */}
                <option disabled style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ★ {language === 'bg' ? 'ТОП МАРКИ' : 'TOP BRANDS'} ★
                </option>
                {carMakes.filter(make => TOP_BRANDS.includes(make)).map(make => (
                  <option key={`top-${make}`} value={make} style={{ fontWeight: 700, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                    {make}
                  </option>
                ))}
                
                {/* All Other Brands */}
                <option disabled style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  {language === 'bg' ? '────── ВСИЧКИ МАРКИ ──────' : '────── ALL BRANDS ──────'}
                </option>
                {carMakes.filter(make => !TOP_BRANDS.includes(make)).map(make => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
                
                <option value="__OTHER__" style={{ borderTop: '2px solid #e2e8f0', fontWeight: 600 }}>
                  {t('advancedSearch.other') || 'Other'}
                </option>
              </SearchSelect>
              {showOtherMake && (
                <SearchInput
                  type="text"
                  name="make"
                  value={searchData.make || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.enterOtherMake') || 'Enter make manually'}
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.model')}</label>
              <SearchInput
                type="text"
                name="model"
                value={searchData.model || ''}
                onChange={onChange}
                placeholder={t('advancedSearch.modelPlaceholder') || 'Enter model'}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.vehicleType')}</label>
              <SearchSelect 
                name="vehicleType" 
                value={showOtherVehicleType ? '__OTHER__' : searchData.vehicleType} 
                onChange={(e) => {
                  if (e.target.value === '__OTHER__') {
                    setShowOtherVehicleType(true);
                    const event = { target: { name: 'vehicleType', value: '' } } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  } else {
                    setShowOtherVehicleType(false);
                    onChange(e);
                  }
                }}
              >
                <option value="">{t('advancedSearch.all')}</option>
                <option value="cabriolet">{t('advancedSearch.cabriolet')}</option>
                <option value="estate">{t('advancedSearch.estate')}</option>
                <option value="offroad">{t('advancedSearch.offroad')}</option>
                <option value="saloon">{t('advancedSearch.saloon')}</option>
                <option value="small">{t('advancedSearch.small')}</option>
                <option value="sports">{t('advancedSearch.sports')}</option>
                <option value="van">{t('advancedSearch.van')}</option>
                <option value="__OTHER__" style={{ borderTop: '2px solid #e2e8f0', fontWeight: 600 }}>
                  {t('advancedSearch.other') || 'Other'}
                </option>
              </SearchSelect>
              {showOtherVehicleType && (
                <SearchInput
                  type="text"
                  name="vehicleType"
                  value={searchData.vehicleType || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.enterOtherVehicleType') || 'Enter vehicle type manually'}
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfSeats')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="seatsFrom"
                  value={searchData.seatsFrom || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="seatsTo"
                  value={searchData.seatsTo || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfDoors')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="doorsFrom"
                  value={searchData.doorsFrom || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="doorsTo"
                  value={searchData.doorsTo || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.slidingDoor')}</label>
              <SearchSelect name="slidingDoor" value={searchData.slidingDoor || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.typeAndCondition')}</label>
              <SearchSelect name="condition" value={searchData.condition || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="new">{t('advancedSearch.newCondition')}</option>
                <option value="used">{t('advancedSearch.usedCondition')}</option>
                <option value="pre-registration">{t('advancedSearch.preRegistrationCondition')}</option>
                <option value="employee">{t('advancedSearch.employeeCondition')}</option>
                <option value="classic">{t('advancedSearch.classicCondition')}</option>
                <option value="demonstration">{t('advancedSearch.demonstrationCondition')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.paymentType')}</label>
              <SearchSelect name="paymentType" value={searchData.paymentType || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="buy">{t('advancedSearch.purchaseOption')}</option>
                <option value="leasing">{t('advancedSearch.leasingOption')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.price')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="priceFrom"
                  value={searchData.priceFrom || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="priceTo"
                  value={searchData.priceTo || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.firstRegistration')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="firstRegistrationFrom"
                  value={searchData.firstRegistrationFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                  min="1950"
                  max="2025"
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="firstRegistrationTo"
                  value={searchData.firstRegistrationTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                  min="1950"
                  max="2025"
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.mileage')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="mileageFrom"
                  value={searchData.mileageFrom || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="mileageTo"
                  value={searchData.mileageTo || ''}
                  onChange={onChange}
                  placeholder={t('advancedSearch.to')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.huValidUntil')}</label>
              <SearchInput
                type="number"
                name="huValid"
                value={searchData.huValid || ''}
                onChange={onChange}
                placeholder={t('advancedSearch.enterMonth')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfOwners')}</label>
              <SearchSelect name="ownersCount" value={searchData.ownersCount || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.fullServiceHistory')}</label>
              <SearchSelect name="serviceHistory" value={searchData.serviceHistory || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="yes">{t('advancedSearch.yesOption')}</option>
                <option value="no">{t('advancedSearch.noOption')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.roadworthy')}</label>
              <SearchSelect name="roadworthy" value={searchData.roadworthy || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="yes">{t('advancedSearch.yesOption')}</option>
                <option value="no">{t('advancedSearch.noOption')}</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

