// src/components/Profile/id-helper/fieldMappings.ts
// ID Card Field Mappings - خرائط حقول البطاقة
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

// Types
interface FieldData {
  label_bg: string;
  label_en: string;
  value: string;
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

interface FieldMappings {
  front: {
    [key: string]: FieldData;
  };
  back: {
    [key: string]: FieldData;
  };
}

// Field positions and labels for Bulgarian ID card
export const fieldMappings: FieldMappings = {
  front: {
    firstName: {
      label_bg: 'Име',
      label_en: 'First Name',
      value: 'СЛАВИНА',
      position: { top: '40%', left: '52%', width: '30%', height: '8%' }
    },
    middleName: {
      label_bg: 'Презиме',
      label_en: 'Father\'s Name',
      value: 'ГЕОРГИЕВА',
      position: { top: '48%', left: '52%', width: '30%', height: '8%' }
    },
    lastName: {
      label_bg: 'Фамилия',
      label_en: 'Surname',
      value: 'ИВАНОВА',
      position: { top: '32%', left: '52%', width: '30%', height: '8%' }
    },
    dateOfBirth: {
      label_bg: 'Дата на раждане',
      label_en: 'Date of Birth',
      value: '01.08.1995',
      position: { top: '64%', left: '52%', width: '30%', height: '6%' }
    }
  },
  back: {
    birthPlace: {
      label_bg: 'Място на раждане',
      label_en: 'Place of Birth',
      value: 'СОФИЯ/SOFIA',
      position: { top: '12%', left: '50%', width: '45%', height: '8%' }
    },
    address: {
      label_bg: 'Постоянен адрес',
      label_en: 'Permanent Address',
      value: 'бул.КНЯГИНЯ МАРИЯ ЛУИЗА 48 ет.5 ап.26',
      position: { top: '28%', left: '15%', width: '70%', height: '10%' }
    },
    city: {
      label_bg: 'Град',
      label_en: 'City',
      value: 'СОФИЯ/SOFIA',
      position: { top: '20%', left: '50%', width: '45%', height: '8%' }
    }
  }
};

