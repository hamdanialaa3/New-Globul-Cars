// ID Card Field Definitions - CORRECTED positions for 1093×690px image
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Image size: 1093px × 690px (actual PNG dimensions)
// Scale factor applied: 1093/850 = 1.286

import { FieldDefinition } from './types';

/**
 * FRONT SIDE FIELDS
 * ⚡ CORRECTED based on actual image analysis and user feedback
 * Image: ID_front (1).png (1093×690px)
 */
export const FRONT_FIELDS: FieldDefinition[] = [
  {
    id: 'documentNumber',
    label: '№ на документа',
    labelEN: 'Document number',
    example: 'AA0000000',
    position: { x: 165, y: 155, width: 250, height: 38 },
    inputType: 'text',
    maxLength: 9,
    pattern: /^[A-Z]{2}\d{7}$/,
    required: true
  },
  {
    id: 'personalNumber',
    label: 'ЕГН',
    labelEN: 'Personal No.',
    example: '9508010133',
    position: { x: 165, y: 200, width: 250, height: 38 },
    inputType: 'text',
    maxLength: 10,
    pattern: /^\d{10}$/,
    required: true,
    validate: 'validateEGN'
  },
  {
    id: 'lastNameBG',
    label: 'Фамилия',
    labelEN: 'Surname',
    example: 'ИВАНОВА',
    position: { x: 165, y: 250, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameBG',
    label: 'Име',
    labelEN: 'Name',
    example: 'СЛАВИНА',
    position: { x: 360, y: 250, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameBG',
    label: 'Презиме',
    labelEN: "Father's name",
    example: 'ГЕОРГИЕВА',
    position: { x: 555, y: 250, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'lastNameEN',
    label: 'Surname (Latin)',
    labelEN: 'Surname',
    example: 'IVANOVA',
    position: { x: 165, y: 295, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameEN',
    label: 'Name (Latin)',
    labelEN: 'Name',
    example: 'SLAVINA',
    position: { x: 360, y: 295, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameEN',
    label: "Father's name (Latin)",
    labelEN: "Father's name",
    example: 'GEORGIEVA',
    position: { x: 555, y: 295, width: 180, height: 38 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'nationality',
    label: 'Гражданство',
    labelEN: 'Nationality',
    example: 'БЪЛГАРИЯ / BGR',
    position: { x: 165, y: 340, width: 250, height: 38 },
    inputType: 'text',
    maxLength: 50,
    readOnly: true
  },
  {
    id: 'dateOfBirth',
    label: 'Дата на раждане',
    labelEN: 'Date of birth',
    example: '01.08.1995',
    position: { x: 165, y: 385, width: 190, height: 38 },
    inputType: 'date-bulgarian',
    required: true,
    autoFillFrom: 'personalNumber'
  },
  {
    id: 'sex',
    label: 'Пол',
    labelEN: 'Sex',
    example: 'Ж / F',
    position: { x: 165, y: 430, width: 90, height: 38 },
    inputType: 'select',
    options: [
      { value: 'M', label: 'М / M' },
      { value: 'F', label: 'Ж / F' }
    ],
    autoFillFrom: 'personalNumber'
  },
  {
    id: 'height',
    label: 'Ръст',
    labelEN: 'Height',
    example: '168',
    position: { x: 280, y: 430, width: 100, height: 38 },
    inputType: 'number',
    min: 140,
    max: 220,
    suffix: 'cm'
  },
  {
    id: 'expiryDate',
    label: 'Валидност',
    labelEN: 'Date of expiry',
    example: '17.06.2034',
    position: { x: 165, y: 475, width: 190, height: 38 },
    inputType: 'date-bulgarian',
    required: true
  },
  {
    id: 'issuingAuthority',
    label: 'Издаден от',
    labelEN: 'Authority',
    example: 'MBP/Mol BGR',
    position: { x: 165, y: 520, width: 320, height: 38 },
    inputType: 'text',
    maxLength: 100
  }
];

/**
 * BACK SIDE FIELDS
 * ⚡ CORRECTED for actual ID_Back.png dimensions
 * Scaled proportionally to match front side corrections
 */
export const BACK_FIELDS: FieldDefinition[] = [
  {
    id: 'placeOfBirth',
    label: 'Място на раждане',
    labelEN: 'Place of birth',
    example: 'СОФИЯ/SOFIA',
    position: { x: 65, y: 105, width: 380, height: 38 },
    inputType: 'text',
    required: true
  },
  {
    id: 'addressOblast',
    label: 'Област',
    labelEN: 'Region',
    example: 'обл.СОФИЯ',
    position: { x: 65, y: 170, width: 450, height: 32 },
    inputType: 'text'
  },
  {
    id: 'addressMunicipality',
    label: 'Община',
    labelEN: 'Municipality',
    example: 'общ.СТОЛИЧНА гр.СОФИЯ/SOFIA',
    position: { x: 65, y: 210, width: 450, height: 32 },
    inputType: 'text'
  },
  {
    id: 'addressStreet',
    label: 'Улица',
    labelEN: 'Street',
    example: 'бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 em.5 an.26',
    position: { x: 65, y: 250, width: 515, height: 32 },
    inputType: 'text'
  },
  {
    id: 'height',
    label: 'Ръст',
    labelEN: 'Height',
    example: '168',
    position: { x: 65, y: 315, width: 130, height: 32 },
    inputType: 'number',
    min: 140,
    max: 220,
    suffix: 'cm',
    autoFillFrom: 'height'
  },
  {
    id: 'eyeColor',
    label: 'Цвят на очите',
    labelEN: 'Color of eyes',
    example: 'КАФЯВИ/BROWN',
    position: { x: 260, y: 315, width: 190, height: 32 },
    inputType: 'select',
    options: [
      { value: 'BROWN', label: 'КАФЯВИ/BROWN' },
      { value: 'BLUE', label: 'СИН/BLUE' },
      { value: 'GREEN', label: 'ЗЕЛЕН/GREEN' },
      { value: 'GREY', label: 'СИВ/GREY' }
    ]
  },
  {
    id: 'issuingAuthority',
    label: 'Издаден от',
    labelEN: 'Authority',
    example: 'MBP/Mol BGR',
    position: { x: 65, y: 380, width: 260, height: 32 },
    inputType: 'text',
    autoFillFrom: 'issuingAuthority'
  },
  {
    id: 'issueDate',
    label: 'Дата на издаване',
    labelEN: 'Date of issue',
    example: '17.06.2024',
    position: { x: 385, y: 380, width: 190, height: 32 },
    inputType: 'date-bulgarian'
  }
];

/**
 * Photo upload zone on front side
 * ⚡ CORRECTED - Photo is on the RIGHT side of the card!
 */
export const PHOTO_ZONE = {
  label: 'Снимка',
  labelEN: 'Photo',
  position: { x: 820, y: 105, width: 212, height: 270 }
};

/**
 * Signature zone on front side
 * ⚡ CORRECTED position
 */
export const SIGNATURE_ZONE = {
  label: 'Подпис',
  labelEN: 'Signature',
  position: { x: 165, y: 580, width: 385, height: 65 }
};

