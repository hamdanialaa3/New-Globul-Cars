// ID Card Field Definitions - PROFESSIONAL SOLUTION
// Using PERCENTAGES instead of pixels - works on ALL screen sizes!
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { FieldDefinition } from './types';

/**
 * ⚡ PROFESSIONAL APPROACH: Percentage-based positioning
 * 
 * Base image: 1093×690px
 * All positions calculated as % of image dimensions
 * 
 * Benefits:
 * - Works on ANY screen size
 * - Scales automatically
 * - No browser differences
 * - No zoom issues
 * 
 * Formula:
 * x% = (x_pixels / 1093) * 100
 * y% = (y_pixels / 690) * 100
 */

export interface PercentageFieldDefinition extends Omit<FieldDefinition, 'position'> {
  position: {
    xPercent: number;      // % from left (0-100)
    yPercent: number;      // % from top (0-100)
    widthPercent: number;  // % of image width
    heightPercent: number; // % of image height
  };
}

/**
 * FRONT SIDE FIELDS (Percentage-based)
 */
export const FRONT_FIELDS_PERCENT: PercentageFieldDefinition[] = [
  {
    id: 'documentNumber',
    label: '№ на документа',
    labelEN: 'Document number',
    example: 'AA0000000',
    position: { 
      xPercent: 46.46,  // +3% total (6 chars right)
      yPercent: 19.14,  // +4.5% total (1.5 fields down)
      widthPercent: 22.87,
      heightPercent: 5.51
    },
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
    position: { 
      xPercent: 46.46,
      yPercent: 25.66,
      widthPercent: 22.87,
      heightPercent: 5.51
    },
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
    position: { 
      xPercent: 46.46,
      yPercent: 32.91,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameBG',
    label: 'Име',
    labelEN: 'Name',
    example: 'СЛАВИНА',
    position: { 
      xPercent: 64.30,
      yPercent: 32.91,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameBG',
    label: 'Презиме',
    labelEN: "Father's name",
    example: 'ГЕОРГИЕВА',
    position: { 
      xPercent: 82.14,
      yPercent: 32.91,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'lastNameEN',
    label: 'Surname (Latin)',
    labelEN: 'Surname',
    example: 'IVANOVA',
    position: { 
      xPercent: 46.46,
      yPercent: 39.43,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'firstNameEN',
    label: 'Name (Latin)',
    labelEN: 'Name',
    example: 'SLAVINA',
    position: { 
      xPercent: 64.30,
      yPercent: 39.43,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'middleNameEN',
    label: "Father's name (Latin)",
    labelEN: "Father's name",
    example: 'GEORGIEVA',
    position: { 
      xPercent: 82.14,
      yPercent: 39.43,
      widthPercent: 16.47,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    required: true
  },
  {
    id: 'nationality',
    label: 'Гражданство',
    labelEN: 'Nationality',
    example: 'БЪЛГАРИЯ / BGR',
    position: { 
      xPercent: 46.46,
      yPercent: 45.95,
      widthPercent: 22.87,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 50,
    readOnly: true
  },
  {
    id: 'dateOfBirth',
    label: 'Дата на раждане',
    labelEN: 'Date of birth',
    example: '01.08.1995',
    position: { 
      xPercent: 46.46,
      yPercent: 52.47,
      widthPercent: 17.38,
      heightPercent: 5.51
    },
    inputType: 'date-bulgarian',
    required: true,
    autoFillFrom: 'personalNumber'
  },
  {
    id: 'sex',
    label: 'Пол',
    labelEN: 'Sex',
    example: 'Ж / F',
    position: { 
      xPercent: 46.46,
      yPercent: 58.99,
      widthPercent: 8.23,
      heightPercent: 5.51
    },
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
    position: { 
      xPercent: 56.98,
      yPercent: 58.99,
      widthPercent: 9.15,
      heightPercent: 5.51
    },
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
    position: { 
      xPercent: 46.46,
      yPercent: 65.51,
      widthPercent: 17.38,
      heightPercent: 5.51
    },
    inputType: 'date-bulgarian',
    required: true
  },
  {
    id: 'issuingAuthority',
    label: 'Издаден от',
    labelEN: 'Authority',
    example: 'MBP/Mol BGR',
    position: { 
      xPercent: 46.46,
      yPercent: 72.04,
      widthPercent: 29.28,
      heightPercent: 5.51
    },
    inputType: 'text',
    maxLength: 100
  }
];

/**
 * BACK SIDE FIELDS (Percentage-based)
 * Base: ID_Back.png (1093×690px - same as front)
 */
export const BACK_FIELDS_PERCENT: PercentageFieldDefinition[] = [
  {
    id: 'placeOfBirth',
    label: 'Място на раждане',
    labelEN: 'Place of birth',
    example: 'СОФИЯ/SOFIA',
    position: { 
      xPercent: 8.95,   // +3% total
      yPercent: 19.72,  // +4.5% total
      widthPercent: 34.77,
      heightPercent: 5.51
    },
    inputType: 'text',
    required: true
  },
  {
    id: 'addressOblast',
    label: 'Област',
    labelEN: 'Region',
    example: 'обл.СОФИЯ',
    position: { 
      xPercent: 8.95,
      yPercent: 29.14,
      widthPercent: 41.17,
      heightPercent: 4.64
    },
    inputType: 'text'
  },
  {
    id: 'addressMunicipality',
    label: 'Община',
    labelEN: 'Municipality',
    example: 'общ.СТОЛИЧНА гр.СОФИЯ/SOFIA',
    position: { 
      xPercent: 8.95,
      yPercent: 34.93,
      widthPercent: 41.17,
      heightPercent: 4.64
    },
    inputType: 'text'
  },
  {
    id: 'addressStreet',
    label: 'Улица',
    labelEN: 'Street',
    example: 'бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 em.5 an.26',
    position: { 
      xPercent: 8.95,
      yPercent: 40.73,
      widthPercent: 47.12,
      heightPercent: 4.64
    },
    inputType: 'text'
  },
  {
    id: 'height',
    label: 'Ръст',
    labelEN: 'Height',
    example: '168',
    position: { 
      xPercent: 8.95,
      yPercent: 50.15,
      widthPercent: 11.89,
      heightPercent: 4.64
    },
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
    position: { 
      xPercent: 26.79,
      yPercent: 50.15,
      widthPercent: 17.38,
      heightPercent: 4.64
    },
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
    position: { 
      xPercent: 8.95,
      yPercent: 59.57,
      widthPercent: 23.79,
      heightPercent: 4.64
    },
    inputType: 'text',
    autoFillFrom: 'issuingAuthority'
  },
  {
    id: 'issueDate',
    label: 'Дата на издаване',
    labelEN: 'Date of issue',
    example: '17.06.2024',
    position: { 
      xPercent: 38.23,
      yPercent: 59.57,
      widthPercent: 17.38,
      heightPercent: 4.64
    },
    inputType: 'date-bulgarian'
  }
];

/**
 * Convert percentage position to pixels based on actual container size
 */
export function percentToPixels(
  percentPos: PercentageFieldDefinition['position'],
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: (percentPos.xPercent / 100) * containerWidth,
    y: (percentPos.yPercent / 100) * containerHeight,
    width: (percentPos.widthPercent / 100) * containerWidth,
    height: (percentPos.heightPercent / 100) * containerHeight
  };
}

