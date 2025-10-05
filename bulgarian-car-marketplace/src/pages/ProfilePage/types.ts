import { BulgarianUser } from '../../firebase';

// Profile Form Data Interface
export interface ProfileFormData {
  // Required fields (from ID card)
  firstName: string;
  lastName: string;
  
  // Optional personal info (from ID card)
  middleName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  
  // Optional physical info (from ID card back)
  height?: string;
  eyeColor?: string;
  
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
  title: string;
  price: number;
  year: number;
  mileage?: number;
  fuelType: string;
  mainImage?: string;
}

// Profile State Interface
export interface ProfileState {
  user: BulgarianUser | null;
  userCars: ProfileCar[];
  loading: boolean;
  editing: boolean;
  formData: ProfileFormData;
}

// Profile Actions Interface
export interface ProfileActions {
  loadUserData: () => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelEdit: () => void;
  handleLogout: () => Promise<void>;
  setEditing: (editing: boolean) => void;
}

// Combined Profile Hook Return Type
export interface UseProfileReturn extends ProfileState, ProfileActions {}