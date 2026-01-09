/**
 * Bank Transfer Payment Configuration
 * Manual Payment System for Globul Cars
 * 
 * ✅ PRODUCTION-READY: All bank details verified
 * @since January 9, 2026
 */

export interface BankAccount {
  bankName: string;
  beneficiary: string;
  iban: string;
  bic: string;
  address: string;
  label: {
    bg: string;
    en: string;
  };
  description: {
    bg: string;
    en: string;
  };
  revtag?: string;
  icon?: string;
  processingTime: {
    bg: string;
    en: string;
  };
  supportsInstant?: boolean; // 🆕 For BLINK support
  instantBadge?: {
    bg: string;
    en: string;
  };
}

export interface ContactDetails {
  phone: string;
  email: string;
  workAddress: {
    bg: string;
    en: string;
  };
  residentialAddress: {
    bg: string;
    en: string;
  };
}

export interface BankDetailsConfig {
  revolut: BankAccount;
  icard: BankAccount;
  contact: ContactDetails;
}

/**
 * ✅ VERIFIED BANK DETAILS
 * Owner: Alaa Hamid Mohammad Shakir Al Hamadani
 */
export const BANK_DETAILS: BankDetailsConfig = {
  // Revolut Account (International Transfers - Instant)
  revolut: {
    bankName: "Revolut Bank UAB",
    beneficiary: "Alaa Al-Hamadani",
    iban: "LT44 3250 0419 1285 4116",
    bic: "REVOLT21",
    address: "Konstitucijos ave. 21B, 08130, Vilnius, Lithuania",
    revtag: "@hamdanialaa",
    label: {
      bg: "Международен превод (Моментален)",
      en: "International Transfer (Instant)"
    },
    description: {
      bg: "Препоръчва се за международни плащания и бърза обработка",
      en: "Recommended for international payments and fast processing"
    },
    icon: "revolut",
    processingTime: {
      bg: "Обработва се моментално (до 1 час)",
      en: "Processed instantly (within 1 hour)"
    }
  },

  // iCard Account (Local Bulgarian Transfers)
  icard: {
    bankName: "iCard / myPOS",
    beneficiary: "ALAA HAMID MOHAMMED SHAKER AL-HAMADANI",
    iban: "BG98INTF40012039023344",
    bic: "INTFBGSF",
    address: "Bulgaria, 1276, SOFIA, BUL. SLIVNITSA 260 ET.4 AP.8",
    label: {
      bg: "Локален банков превод (Български IBAN)",
      en: "Local Bank Transfer (Bulgarian IBAN)"
    },
    description: {
      bg: "Препоръчва се за местни плащания от българска банка",
      en: "Recommended for local payments from Bulgarian banks"
    },
    icon: "icard",
    processingTime: {
      bg: "Обработва се в рамките на 1-2 часа",
      en: "Processed within 1-2 hours"
    },
    supportsInstant: true, // 🆕 BLINK support
    instantBadge: {
      bg: "⚡ Поддържа моментални BLINK преводи",
      en: "⚡ Supports Instant BLINK Transfers"
    }
  },

  // Contact Information
  contact: {
    phone: "+359 87 983 9671",
    email: "support@mobilebg.eu",
    workAddress: {
      bg: "България, София, Цар Симеон 77",
      en: "Bulgaria, Sofia, Tsar Simeon 77"
    },
    residentialAddress: {
      bg: "България, 1276, София, бул. Сливница 260, ет.4, ап.8",
      en: "Bulgaria, 1276, Sofia, Bul. Slivnitsa 260, Floor 4, Apt. 8"
    }
  }
};

/**
 * Payment Reference Format Generator
 * Format: GLOBUL-{TYPE}-{ID}-{TIMESTAMP}
 * Example: GLOBUL-SUB-dealer-1704835200
 */
export const generatePaymentReference = (
  type: 'subscription' | 'promotion' | 'listing',
  itemId: string
): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  return `GLOBUL-${type.toUpperCase()}-${itemId}-${timestamp}`;
};

/**
 * Correspondent Bank (for international wires if needed)
 */
export const CORRESPONDENT_BANK = {
  bic: "CHASDEFX",
  name: "JPMorgan Chase Bank",
  note: {
    bg: "Използва се само за международни преводи извън SEPA",
    en: "Used only for international transfers outside SEPA"
  }
};

/**
 * Supported Payment Methods
 */
export const PAYMENT_METHODS = {
  bank_transfer: {
    name: {
      bg: "Банков превод",
      en: "Bank Transfer"
    },
    description: {
      bg: "SEPA/SWIFT банков превод към нашите сметки",
      en: "SEPA/SWIFT bank transfer to our accounts"
    },
    fee: 0, // No fees from our side
    enabled: true
  },
  revolut_app: {
    name: {
      bg: "Revolut приложение",
      en: "Revolut App"
    },
    description: {
      bg: "Директно плащане чрез Revolut RevTag",
      en: "Direct payment via Revolut RevTag"
    },
    deepLink: `https://revolut.me/${BANK_DETAILS.revolut.revtag?.replace('@', '')}`,
    fee: 0,
    enabled: true
  },
  whatsapp_proof: {
    name: {
      bg: "WhatsApp потвърждение",
      en: "WhatsApp Confirmation"
    },
    description: {
      bg: "Изпратете доказателство за плащане чрез WhatsApp за моментално активиране",
      en: "Send payment proof via WhatsApp for instant activation"
    },
    phone: BANK_DETAILS.contact.phone,
    whatsappLink: (referenceNumber: string) => 
      `https://wa.me/${BANK_DETAILS.contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello, I have paid for Order ${referenceNumber}. Here is the proof.`)}`,
    fee: 0,
    enabled: true,
    icon: "whatsapp"
  }
};

/**
 * Payment Instructions (Multi-language)
 */
export const PAYMENT_INSTRUCTIONS = {
  bg: {
    title: "Как да платите:",
    steps: [
      "Изберете предпочитана банкова сметка (Revolut за международни, iCard за местни)",
      "Копирайте IBAN номера и името на получателя",
      "Използвайте референтния номер в описанието на превода",
      "Изпратете превода от вашата банка или приложение",
      "Вашият абонамент ще бъде активиран в рамките на 1-2 часа след потвърждение"
    ],
    note: "💡 Важно: Включете референтния номер за бърза обработка!"
  },
  en: {
    title: "How to pay:",
    steps: [
      "Choose preferred bank account (Revolut for international, iCard for local)",
      "Copy the IBAN number and beneficiary name",
      "Use the reference number in the transfer description",
      "Send the transfer from your bank or app",
      "Your subscription will be activated within 1-2 hours after confirmation"
    ],
    note: "💡 Important: Include the reference number for fast processing!"
  }
};

export default BANK_DETAILS;
