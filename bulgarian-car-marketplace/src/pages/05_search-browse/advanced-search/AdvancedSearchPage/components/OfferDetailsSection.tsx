import React from 'react';
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
  SearchSelect,
  CheckboxLabel,
  CustomCheckbox
} from '../styles';
import { SearchData } from '../types';

interface OfferDetailsSectionProps {
  searchData: SearchData;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const OfferDetailsSection: React.FC<OfferDetailsSectionProps> = ({
  searchData,
  isOpen,
  onToggle,
  onChange
}) => {
  const { t } = useTranslation();

  return (
    <SectionCard>
      <SectionHeader $isOpen={isOpen} onClick={onToggle}>
        <SectionTitle>{t('advancedSearch.offerDetails')}</SectionTitle>
        <ExpandIcon $isOpen={isOpen} />
      </SectionHeader>
      <SectionContent $isOpen={isOpen}>
        <SectionBody>
          <FormGrid>
            <FormGroup>
              <label>{t('advancedSearch.seller')}</label>
              <SearchSelect name="seller" value={searchData.seller || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="dealer">{t('advancedSearch.dealer')}</option>
                <option value="private">{t('advancedSearch.privateSeller')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.dealerRating')}</label>
              <SearchSelect name="dealerRating" value={searchData.dealerRating || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="excellent">{t('advancedSearch.excellentRating')}</option>
                <option value="very-good">{t('advancedSearch.veryGoodRating')}</option>
                <option value="good">{t('advancedSearch.goodRating')}</option>
                <option value="satisfactory">{t('advancedSearch.satisfactoryRating')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.adOnlineSince')}</label>
              <SearchSelect name="adOnlineSince" value={searchData.adOnlineSince || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="1">{t('advancedSearch.lastDay')}</option>
                <option value="3">{t('advancedSearch.last3Days')}</option>
                <option value="7">{t('advancedSearch.lastWeek')}</option>
                <option value="30">{t('advancedSearch.lastMonth')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.adsWithPictures')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={searchData.adsWithPictures}
                  onChange={(e) => onChange({ target: { name: 'adsWithPictures', value: e.target.checked } } as any)}
                />
                <CustomCheckbox checked={searchData.adsWithPictures} />
                {t('advancedSearch.onlyWithPictures')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.adsWithVideo')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="adsWithVideo"
                  checked={searchData.adsWithVideo}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.adsWithVideo} />
                {t('advancedSearch.onlyWithVideo')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.discountOffers')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="discountOffers"
                  checked={searchData.discountOffers}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.discountOffers} />
                {t('advancedSearch.onlyDiscountOffers')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.nonSmokerVehicle')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="nonSmokerVehicle"
                  checked={searchData.nonSmokerVehicle}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.nonSmokerVehicle} />
                {t('advancedSearch.onlyNonSmoker')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.taxi')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="taxi"
                  checked={searchData.taxi}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.taxi} />
                {t('advancedSearch.onlyTaxi')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.vatReclaimable')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="vatReclaimable"
                  checked={searchData.vatReclaimable}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.vatReclaimable} />
                {t('advancedSearch.onlyVatReclaimable')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.warranty')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="warranty"
                  checked={searchData.warranty}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.warranty} />
                {t('advancedSearch.onlyWithWarranty')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.damagedVehicles')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="damagedVehicles"
                  checked={searchData.damagedVehicles}
                  onChange={onChange}
                />
                <CustomCheckbox checked={searchData.damagedVehicles} />
                {t('advancedSearch.includeDamaged')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.commercialExport')}</label>
              <SearchSelect name="commercialExport" value={searchData.commercialExport || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.approvedUsedProgramme')}</label>
              <SearchSelect name="approvedUsedProgramme" value={searchData.approvedUsedProgramme || ''} onChange={onChange}>
                <option value="">{t('advancedSearch.all')}</option>
                <option value="yes">{t('advancedSearch.yes')}</option>
                <option value="no">{t('advancedSearch.no')}</option>
              </SearchSelect>
            </FormGroup>
          </FormGrid>
        </SectionBody>
      </SectionContent>
    </SectionCard>
  );
};

