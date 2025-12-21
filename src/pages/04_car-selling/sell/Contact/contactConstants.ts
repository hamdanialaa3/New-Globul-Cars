import { ContactIconId } from '../../../../components/icons/contact/ContactMethodIcons';

export interface ContactMethodDefinition {
  id: ContactIconId;
  icon: ContactIconId;
  labelBg: string;
  labelEn: string;
}

export const CONTACT_METHODS: ContactMethodDefinition[] = [
  { id: 'phone', icon: 'phone', labelBg: 'Телефон', labelEn: 'Phone' },
  { id: 'email', icon: 'email', labelBg: 'Имейл', labelEn: 'Email' },
  { id: 'whatsapp', icon: 'whatsapp', labelBg: 'WhatsApp', labelEn: 'WhatsApp' },
  { id: 'viber', icon: 'viber', labelBg: 'Viber', labelEn: 'Viber' },
  { id: 'telegram', icon: 'telegram', labelBg: 'Telegram', labelEn: 'Telegram' },
  { id: 'messenger', icon: 'messenger', labelBg: 'Facebook Messenger', labelEn: 'Facebook Messenger' },
  { id: 'sms', icon: 'sms', labelBg: 'SMS', labelEn: 'SMS' }
];

export const CONTACT_REQUIRED_HINT = {
  bg: 'Препоръчително е да изберете поне един метод за контакт',
  en: 'It is recommended to select at least one contact method'
};

