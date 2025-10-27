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
      xPercent: 43.46,  // 475/1093 * 100
      yPercent: 14.64,  // 101/690 * 100
      widthPercent: 22.87,  // 250/1093 * 100
      heightPercent: 5.51   // 38/690 * 100
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
      xPercent: 43.46,  // 475/1093
      yPercent: 21.16,  // 146/690
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
      xPercent: 43.46,
      yPercent: 28.41,  // 196/690
      widthPercent: 16.47,  // 180/1093
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
      xPercent: 61.30,  // 670/1093
      yPercent: 28.41,
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
      xPercent: 79.14,  // 865/1093
      yPercent: 28.41,
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
      xPercent: 43.46,
      yPercent: 34.93,  // 241/690
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
      xPercent: 61.30,
      yPercent: 34.93,
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
      xPercent: 79.14,
      yPercent: 34.93,
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
      xPercent: 43.46,
      yPercent: 41.45,  // 286/690
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
      xPercent: 43.46,
      yPercent: 47.97,  // 331/690
      widthPercent: 17.38,  // 190/1093
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
      xPercent: 43.46,
      yPercent: 54.49,  // 376/690
      widthPercent: 8.23,  // 90/1093
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
      xPercent: 53.98,  // 590/1093
      yPercent: 54.49,
      widthPercent: 9.15,  // 100/1093
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
      xPercent: 43.46,
      yPercent: 61.01,  // 421/690
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
      xPercent: 43.46,
      yPercent: 67.54,  // 466/690
      widthPercent: 29.28,  // 320/1093
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
      xPercent: 5.95,   // 65/1093
      yPercent: 15.22,  // 105/690
      widthPercent: 34.77,  // 380/1093
      heightPercent: 5.51   // 38/690
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
      xPercent: 5.95,
      yPercent: 24.64,  // 170/690
      widthPercent: 41.17,  // 450/1093
      heightPercent: 4.64   // 32/690
    },
    inputType: 'text'
  },
  {
    id: 'addressMunicipality',
    label: 'Община',
    labelEN: 'Municipality',
    example: 'общ.СТОЛИЧНА гр.СОФИЯ/SOFIA',
    position: { 
      xPercent: 5.95,
      yPercent: 30.43,  // 210/690
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
      xPercent: 5.95,
      yPercent: 36.23,  // 250/690
      widthPercent: 47.12,  // 515/1093
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
      xPercent: 5.95,
      yPercent: 45.65,  // 315/690
      widthPercent: 11.89,  // 130/1093
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
      xPercent: 23.79,  // 260/1093
      yPercent: 45.65,
      widthPercent: 17.38,  // 190/1093
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
      xPercent: 5.95,
      yPercent: 55.07,  // 380/690
      widthPercent: 23.79,  // 260/1093
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
      xPercent: 35.23,  // 385/1093
      yPercent: 55.07,
      widthPercent: 17.38,  // 190/1093
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

