import { BulgarianUser } from '../../firebase';

// Account Type
export type AccountType = 'individual' | 'business';

// Business Type
export type BusinessType = 'dealership' | 'trader' | 'company';

// Profile Form Data Interface
export interface ProfileFormData {
  // Account Type
  accountType: AccountType;
  
  // Required fields (from ID card) - For Individual
  firstName: string;
  lastName: string;
  
  // Optional personal info (from ID card) - For Individual
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  
  // Business Information - For Business
  businessName?: string;           // Име на фирмата (Required for business)
  bulstat?: string;                 // БУЛСТАТ/ЕИК (Bulgarian Company Registration)
  vatNumber?: string;               // ДДС номер (VAT Number)
  businessType?: BusinessType;      // Тип на бизнеса
  registrationNumber?: string;      // Търговски регистър
  businessAddress?: string;         // Адрес на фирмата
  businessCity?: string;            // Град
  businessPostalCode?: string;      // Пощенски код
  website?: string;                 // Уебсайт
  businessPhone?: string;           // Телефон на фирмата
  businessEmail?: string;           // Имейл на фирмата
  workingHours?: string;            // Работно време
  businessDescription?: string;     // Описание на бизнеса
  
  // Optional contact & location (from ID card back)
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  
  // Optional other
  bio?: string;
  preferredLanguage: string;
  
  // Legacy (for backwards compatibility)
  displayName?: string;
  region?: string;
}

// Profile Statistics Interface
export interface ProfileStats {
  cars: number;
  favorites: number;
}

// Car Information Interface (simplified for profile display)
export interface ProfileCar {
  id: string;
  title?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  imageUrl: string;
  mainImage?: string;
  mileage?: number;
  fuelType?: string;
  status?: 'active' | 'sold' | 'pending' | 'draft';
  viewCount?: number;
  views?: number;
  inquiries?: number;
}

// Profile State Interface
export interface ProfileState {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  loading: boolean;
  editing: boolean;
  formData: ProfileFormData;
  isOwnProfile: boolean; // NEW: to determine if viewing own profile
}

// Profile Actions Interface
export interface ProfileActions {
  loadUserData: () => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
  setEditing: (editing: boolean) => void;
  setUser: React.Dispatch<React.SetStateAction<BulgarianUser | null>>;
}

// Combined Profile Hook Return Type
export interface UseProfileReturn extends ProfileState, ProfileActions {
  loadUserCars?: () => void;
}