// ID Card Field Definitions - Exact positions on ID card images
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Image size: 850px × 540px (ratio 1.6:1)

import { FieldDefinition } from './types';

/**
 * FRONT SIDE FIELDS
 * Based on precise analysis of ID_front (1).jpg
 */
export const FRONT_FIELDS: FieldDefinition[] = [
  {
    id: 'documentNumber',
    label: '№ на документа',
    labelEN: 'Document number',
    example: 'AA0000000',
    position: { x: 127, y: 119, width: 200, height: 30 },
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
    position: { x: 127, y: 151, width: 200, height: 30 },
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
    position: { x: 127, y: 189, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameBG',
    label: 'Име',
    labelEN: 'Name',
    example: 'СЛАВИНА',
    position: { x: 267, y: 189, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameBG',
    label: 'Презиме',
    labelEN: "Father's name",
    example: 'ГЕОРГИЕВА',
    position: { x: 407, y: 189, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'lastNameEN',
    label: 'Surname (Latin)',
    labelEN: 'Surname',
    example: 'IVANOVA',
    position: { x: 127, y: 221, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameEN',
    label: 'Name (Latin)',
    labelEN: 'Name',
    example: 'SLAVINA',
    position: { x: 267, y: 221, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameEN',
    label: "Father's name (Latin)",
    labelEN: "Father's name",
    example: 'GEORGIEVA',
    position: { x: 407, y: 221, width: 130, height: 30 },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'nationality',
    label: 'Гражданство',
    labelEN: 'Nationality',
    example: 'БЪЛГАРИЯ / BGR',
    position: { x: 127, y: 254, width: 200, height: 30 },
    inputType: 'text',
    maxLength: 50,
    readOnly: true
  },
  {
    id: 'dateOfBirth',
    label: 'Дата на раждане',
    labelEN: 'Date of birth',
    example: '01.08.1995',
    position: { x: 127, y: 286, width: 150, height: 30 },
    inputType: 'date-bulgarian',
    required: true,
    autoFillFrom: 'personalNumber'
  },
  {
    id: 'sex',
    label: 'Пол',
    labelEN: 'Sex',
    example: 'Ж / F',
    position: { x: 127, y: 318, width: 70, height: 30 },
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
    position: { x: 220, y: 318, width: 80, height: 30 },
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
    position: { x: 127, y: 351, width: 150, height: 30 },
    inputType: 'date-bulgarian',
    required: true
  },
  {
    id: 'issuingAuthority',
    label: 'Издаден от',
    labelEN: 'Authority',
    example: 'MBP/Mol BGR',
    position: { x: 127, y: 383, width: 250, height: 30 },
    inputType: 'text',
    maxLength: 100
  }
];

/**
 * BACK SIDE FIELDS
 * Based on precise analysis of ID_Back.jpg
 */
export const BACK_FIELDS: FieldDefinition[] = [
  {
    id: 'placeOfBirth',
    label: 'Място на раждане',
    labelEN: 'Place of birth',
    example: 'СОФИЯ/SOFIA',
    position: { x: 50, y: 80, width: 300, height: 30 },
    inputType: 'text',
    required: true
  },
  {
    id: 'addressOblast',
    label: 'Област',
    labelEN: 'Region',
    example: 'обл.СОФИЯ',
    position: { x: 50, y: 130, width: 350, height: 25 },
    inputType: 'text'
  },
  {
    id: 'addressMunicipality',
    label: 'Община',
    labelEN: 'Municipality',
    example: 'общ.СТОЛИЧНА гр.СОФИЯ/SOFIA',
    position: { x: 50, y: 160, width: 350, height: 25 },
    inputType: 'text'
  },
  {
    id: 'addressStreet',
    label: 'Улица',
    labelEN: 'Street',
    example: 'бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 em.5 an.26',
    position: { x: 50, y: 190, width: 400, height: 25 },
    inputType: 'text'
  },
  {
    id: 'height',
    label: 'Ръст',
    labelEN: 'Height',
    example: '168',
    position: { x: 50, y: 240, width: 100, height: 25 },
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
    position: { x: 200, y: 240, width: 150, height: 25 },
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
    position: { x: 50, y: 290, width: 200, height: 25 },
    inputType: 'text',
    autoFillFrom: 'issuingAuthority'
  },
  {
    id: 'issueDate',
    label: 'Дата на издаване',
    labelEN: 'Date of issue',
    example: '17.06.2024',
    position: { x: 300, y: 290, width: 150, height: 25 },
    inputType: 'date-bulgarian'
  }
];

/**
 * Photo upload zone on front side
 */
export const PHOTO_ZONE = {
  label: 'Снимка',
  labelEN: 'Photo',
  position: { x: 637, y: 81, width: 165, height: 210 }
};

/**
 * Signature zone on front side
 */
export const SIGNATURE_ZONE = {
  label: 'Подпис',
  labelEN: 'Signature',
  position: { x: 127, y: 443, width: 300, height: 50 }
};

