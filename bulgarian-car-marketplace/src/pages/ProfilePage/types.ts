import { BulgarianUser } from '../../firebase';

// Profile Form Data Interface
export interface ProfileFormData {
  displayName: string;
  phoneNumber: string;
  city: string;
  region: string;
  bio: string;
  preferredLanguage: string;
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