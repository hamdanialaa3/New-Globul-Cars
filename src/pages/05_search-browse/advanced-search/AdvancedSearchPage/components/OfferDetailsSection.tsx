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
                  name="adsWithPictures"
                  checked={searchData.adsWithPictures || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'adsWithPictures',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.adsWithPictures || false} />
                {t('advancedSearch.onlyWithPictures')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.adsWithVideo')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="adsWithVideo"
                  checked={searchData.adsWithVideo || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'adsWithVideo',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.adsWithVideo || false} />
                {t('advancedSearch.onlyWithVideo')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.discountOffers')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="discountOffers"
                  checked={searchData.discountOffers || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'discountOffers',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.discountOffers || false} />
                {t('advancedSearch.onlyDiscountOffers')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.nonSmokerVehicle')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="nonSmokerVehicle"
                  checked={searchData.nonSmokerVehicle || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'nonSmokerVehicle',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.nonSmokerVehicle || false} />
                {t('advancedSearch.onlyNonSmoker')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.taxi')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="taxi"
                  checked={searchData.taxi || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'taxi',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.taxi || false} />
                {t('advancedSearch.onlyTaxi')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.vatReclaimable')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="vatReclaimable"
                  checked={searchData.vatReclaimable || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'vatReclaimable',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.vatReclaimable || false} />
                {t('advancedSearch.onlyVatReclaimable')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.warranty')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="warranty"
                  checked={searchData.warranty || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'warranty',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.warranty || false} />
                {t('advancedSearch.onlyWithWarranty')}
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <label>{t('advancedSearch.damagedVehicles')}</label>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  name="damagedVehicles"
                  checked={searchData.damagedVehicles || false}
                  onChange={(e) => {
                    const event = {
                      target: {
                        name: 'damagedVehicles',
                        value: e.target.checked,
                        type: 'checkbox',
                        checked: e.target.checked
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
                <CustomCheckbox checked={searchData.damagedVehicles || false} />
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

