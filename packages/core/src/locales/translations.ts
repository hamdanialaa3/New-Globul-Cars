// Main translations - Bulgarian + English only
import * as bg from './bg';
import * as en from './en';

export const translations = {
  bg,
  en
} as const;

export type Language = 'bg' | 'en';

export default translations;
