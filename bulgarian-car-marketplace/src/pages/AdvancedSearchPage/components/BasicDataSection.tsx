import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
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

  return (
    <SectionCard>
      <SectionHeader isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.basicData')}</SectionTitle>
        <ExpandIcon isOpen={isOpen} />
      </SectionHeader>
      <SectionContent isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.make')}</label>
              <SearchSelect name="make" value={searchData.make} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                {carMakes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.model')}</label>
              <SearchInput
                type="text"
                name="model"
                value={searchData.model}
                onChange={onChange}
                placeholder={t('advancedSearch.modelPlaceholder')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.vehicleType')}</label>
              <SearchSelect name="vehicleType" value={searchData.vehicleType} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="cabriolet">{t('advancedSearch.cabriolet')}</option>
                <option value="estate">{t('advancedSearch.estate')}</option>
                <option value="offroad">{t('advancedSearch.offroad')}</option>
                <option value="saloon">{t('advancedSearch.saloon')}</option>
                <option value="small">{t('advancedSearch.small')}</option>
                <option value="sports">{t('advancedSearch.sports')}</option>
                <option value="van">{t('advancedSearch.van')}</option>
                <option value="other">{t('advancedSearch.other')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfSeats')}</label>
              <RangeGroup>
                <SearchInput
                  type="number"
                  name="seatsFrom"
                  value={searchData.seatsFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="seatsTo"
                  value={searchData.seatsTo}
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
                  value={searchData.doorsFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.from')}
                />
                <span></span>
                <SearchInput
                  type="number"
                  name="doorsTo"
                  value={searchData.doorsTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.slidingDoor')}</label>
              <SearchSelect name="slidingDoor" value={searchData.slidingDoor} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.typeAndCondition')}</label>
              <SearchSelect name="condition" value={searchData.condition} onChange={onChange}>
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
              <SearchSelect name="paymentType" value={searchData.paymentType} onChange={onChange}>
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
                  value={searchData.priceFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>€</span>
                <SearchInput
                  type="number"
                  name="priceTo"
                  value={searchData.priceTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
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
                  value={searchData.mileageFrom}
                  onChange={onChange}
                  placeholder={t('advancedSearch.fromPlaceholder')}
                />
                <span>km</span>
                <SearchInput
                  type="number"
                  name="mileageTo"
                  value={searchData.mileageTo}
                  onChange={onChange}
                  placeholder={t('advancedSearch.toPlaceholder')}
                />
              </RangeGroup>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.huValidUntil')}</label>
              <SearchInput
                type="number"
                name="huValid"
                value={searchData.huValid}
                onChange={onChange}
                placeholder={t('advancedSearch.exampleYear')}
              />
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.numberOfOwners')}</label>
              <SearchSelect name="ownersCount" value={searchData.ownersCount} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.fullServiceHistory')}</label>
              <SearchSelect name="serviceHistory" value={searchData.serviceHistory} onChange={onChange}>
                <option value="">{t('advancedSearch.allOptions')}</option>
                <option value="yes">{t('advancedSearch.yesOption')}</option>
                <option value="no">{t('advancedSearch.noOption')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.roadworthy')}</label>
              <SearchSelect name="roadworthy" value={searchData.roadworthy} onChange={onChange}>
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

