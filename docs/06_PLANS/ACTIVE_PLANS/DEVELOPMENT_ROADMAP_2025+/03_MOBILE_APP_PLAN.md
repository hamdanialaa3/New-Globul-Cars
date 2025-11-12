# 📱 MOBILE APP PLAN - React Native Development
## Cross-Platform Mobile Application for Bulgarian Car Marketplace

**Phase:** 3  
**Duration:** 6 weeks  
**Priority:** MEDIUM-LOW (Strategic Long-term)  
**Dependencies:** Stable backend APIs, PWA patterns (helpful)

---

## 🎯 **Objectives**

### **Primary Goals:**
1. ✅ Launch iOS app on App Store
2. ✅ Launch Android app on Google Play Store
3. ✅ Achieve feature parity with web (core features)
4. ✅ 4.0+ star rating target
5. ✅ 1,000+ installs in first month

### **Why Mobile App?**
- ✅ **Better Performance** - Native feel, smoother animations
- ✅ **Better Integration** - Device features (camera, GPS, biometrics)
- ✅ **Better Discovery** - App Store/Play Store presence
- ✅ **Better Engagement** - Push notifications, home screen presence
- ✅ **Premium Perception** - Native app = serious business

---

## 🎨 **App Architecture**

### **Technology Stack:**
```typescript
Core:
  - React Native 0.73+
  - TypeScript 5.0+
  - React Navigation 6.x
  - Async Storage
  - React Native Firebase

UI/UX:
  - React Native Paper (Material Design)
  - React Native Elements
  - Styled Components (React Native)
  - React Native Reanimated 3.x
  - React Native Gesture Handler

Backend:
  - Firebase SDK (existing)
  - Socket.io Client (existing)
  - Axios for REST APIs

Build & Deploy:
  - React Native CLI (preferred)
  - OR Expo (faster development, optional)
  - Fastlane (CI/CD automation)
  - CodePush (OTA updates)
```

---

## 📂 **Project Structure**

```
mobile-app/
├── src/
│   ├── screens/              # App screens (pages)
│   │   ├── Home/
│   │   ├── Cars/
│   │   ├── CarDetails/
│   │   ├── Sell/
│   │   ├── Profile/
│   │   ├── Messages/
│   │   └── Auth/
│   │
│   ├── components/           # Reusable components
│   │   ├── CarCard/
│   │   ├── UserCard/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── ...
│   │
│   ├── navigation/           # Navigation config
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── services/             # API services (reuse from web)
│   │   ├── auth.service.ts
│   │   ├── cars.service.ts
│   │   ├── messaging.service.ts
│   │   └── ...
│   │
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useLanguage.ts
│   │   └── ...
│   │
│   ├── contexts/             # Context providers
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   ├── assets/               # Images, fonts, etc.
│   └── config/               # App configuration
│
├── android/                  # Android-specific code
├── ios/                      # iOS-specific code
├── __tests__/                # Test files
├── app.json                  # App configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## 📋 **Core Features (MVP)**

### **Phase 1: Essential Features (Weeks 1-3)**

#### **1. Authentication (Priority: CRITICAL)**
```
Screens:
  ✅ Splash Screen (app loading)
  ✅ Login Screen
  ✅ Register Screen
  ✅ Email Verification Screen
  ✅ Forgot Password Screen

Features:
  ✅ Email/Password authentication
  ✅ Google Sign-in
  ✅ Facebook Sign-in
  ✅ Apple Sign-in (iOS required)
  ✅ Biometric authentication (Touch ID/Face ID)
  ✅ Remember me (secure token storage)
```

#### **2. Home & Navigation (Priority: CRITICAL)**
```
Screens:
  ✅ Home Screen (featured cars, stats)
  ✅ Bottom Tab Navigation (5 tabs)

Tabs:
  1. Home (featured, search)
  2. Browse (all cars with filters)
  3. Sell (FAB button, workflow)
  4. Messages (real-time chat)
  5. Profile (user settings)
```

#### **3. Car Browsing (Priority: HIGH)**
```
Screens:
  ✅ Cars List Screen (infinite scroll)
  ✅ Car Details Screen (images, specs, contact)
  ✅ Search Screen (advanced filters)

Features:
  ✅ Infinite scroll pagination
  ✅ Image gallery (swipeable)
  ✅ Favorite cars (heart icon)
  ✅ Share car (native share sheet)
  ✅ Call seller (native phone call)
  ✅ WhatsApp seller (deep link)
  ✅ Google Maps integration (seller location)
```

#### **4. Sell Workflow (Priority: HIGH)**
```
Screens:
  ✅ Vehicle Type Selection
  ✅ Seller Type Selection
  ✅ Vehicle Data Entry (7 steps)
  ✅ Image Upload (camera + gallery)
  ✅ Pricing Screen
  ✅ Contact Info Screen
  ✅ Preview Screen
  ✅ Success Screen

Features:
  ✅ Step-by-step wizard (progress indicator)
  ✅ Camera integration (take photos)
  ✅ Image picker (gallery selection)
  ✅ Image compression (auto)
  ✅ Draft saving (resume later)
  ✅ Form validation (real-time)
```

---

### **Phase 2: Advanced Features (Weeks 4-5)**

#### **5. Messaging (Priority: HIGH)**
```
Screens:
  ✅ Messages List Screen
  ✅ Chat Screen (1-on-1)
  ✅ New Message Screen

Features:
  ✅ Real-time messaging (Socket.io)
  ✅ Push notifications (FCM)
  ✅ Unread count badge
  ✅ Online status indicator
  ✅ Typing indicator
  ✅ Image sharing in chat
  ✅ Message timestamp
```

#### **6. Profile Management (Priority: MEDIUM)**
```
Screens:
  ✅ Profile Screen (view)
  ✅ Edit Profile Screen
  ✅ My Listings Screen
  ✅ Favorites Screen
  ✅ Settings Screen

Features:
  ✅ Profile image upload (camera/gallery)
  ✅ Cover image upload
  ✅ Edit personal info
  ✅ Change password
  ✅ Notification settings
  ✅ Language selection (BG/EN)
  ✅ Theme selection (Light/Dark)
  ✅ Logout
```

#### **7. Notifications (Priority: MEDIUM)**
```
Screens:
  ✅ Notifications List Screen

Features:
  ✅ Push notifications (FCM)
  ✅ Notification types:
     - New message
     - Price drop
     - New listing (saved search)
     - Verification status
  ✅ Deep linking (open specific screen)
  ✅ Badge count on app icon
```

---

### **Phase 3: Polish & Optimization (Week 6)**

#### **8. Performance Optimization**
```
  ✅ Image lazy loading
  ✅ Memoization (React.memo, useMemo)
  ✅ FlatList optimization
  ✅ Code splitting (lazy imports)
  ✅ Bundle size optimization
  ✅ Startup time optimization
```

#### **9. Error Handling & Analytics**
```
  ✅ Crash reporting (Sentry)
  ✅ Analytics (Firebase Analytics)
  ✅ Error boundaries
  ✅ Offline detection
  ✅ Network error handling
  ✅ User feedback collection
```

---

## 🛠️ **Development Setup**

### **1. Initialize Project:**
```bash
# Using React Native CLI (recommended)
npx react-native init GlobulCars --template react-native-template-typescript

# OR using Expo (faster, easier)
npx create-expo-app GlobulCars --template
```

### **2. Install Dependencies:**
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# Firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/messaging

# UI Components
npm install react-native-paper react-native-elements react-native-vector-icons

# Other utilities
npm install axios socket.io-client @react-native-async-storage/async-storage
npm install react-native-image-picker react-native-image-crop-picker
npm install react-native-maps react-native-geolocation-service
npm install react-native-biometrics
```

### **3. Configure Firebase:**
```bash
# iOS
cd ios && pod install && cd ..

# Add GoogleService-Info.plist (iOS)
# Add google-services.json (Android)
```

---

## 📱 **Screen Designs & Examples**

### **Home Screen:**
```typescript
// src/screens/Home/HomeScreen.tsx
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FeaturedCars } from '@/components/FeaturedCars';
import { Stats } from '@/components/Stats';
import { SearchBar } from '@/components/SearchBar';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ScrollView>
      <SearchBar onPress={() => navigation.navigate('Search')} />
      <Stats />
      <FeaturedCars />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20 }}>
        Recently Added
      </Text>
      {/* Car cards... */}
    </ScrollView>
  );
};

export default HomeScreen;
```

### **Car Details Screen:**
```typescript
// src/screens/Cars/CarDetailsScreen.tsx
import React from 'react';
import { ScrollView, Image, View, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Heart, Phone, MessageCircle, Share } from 'lucide-react-native';

const CarDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { carId } = route.params;

  const [car, setCar] = useState(null);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    fetchCarDetails(carId);
  }, [carId]);

  return (
    <ScrollView>
      {/* Image Gallery */}
      <ImageGallery images={car?.images} />

      {/* Car Info */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          {car?.make} {car?.model}
        </Text>
        <Text style={{ fontSize: 32, color: '#CC0000', fontWeight: 'bold' }}>
          {car?.price} EUR
        </Text>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity onPress={() => setFavorite(!favorite)}>
            <Heart fill={favorite ? '#CC0000' : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => callSeller(car?.phone)}>
            <Phone />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => messageSeller(car?.sellerId)}>
            <MessageCircle />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shareCar(car)}>
            <Share />
          </TouchableOpacity>
        </View>

        {/* Specifications */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Specifications</Text>
          <SpecRow label="Year" value={car?.year} />
          <SpecRow label="Mileage" value={`${car?.mileage} km`} />
          <SpecRow label="Fuel Type" value={car?.fuelType} />
          <SpecRow label="Transmission" value={car?.transmission} />
        </View>
      </View>
    </ScrollView>
  );
};
```

### **Sell Workflow Screen:**
```typescript
// src/screens/Sell/VehicleDataScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const VehicleDataScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    vin: '',
  });

  const handleNext = () => {
    // Validate form
    // Save draft
    navigation.navigate('Equipment');
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Input
        label="Make"
        value={formData.make}
        onChangeText={(value) => setFormData({ ...formData, make: value })}
      />
      <Input
        label="Model"
        value={formData.model}
        onChangeText={(value) => setFormData({ ...formData, model: value })}
      />
      <Input
        label="Year"
        value={formData.year}
        onChangeText={(value) => setFormData({ ...formData, year: value })}
        keyboardType="numeric"
      />
      <Input
        label="Mileage (km)"
        value={formData.mileage}
        onChangeText={(value) => setFormData({ ...formData, mileage: value })}
        keyboardType="numeric"
      />
      <Input
        label="VIN (Optional)"
        value={formData.vin}
        onChangeText={(value) => setFormData({ ...formData, vin: value })}
      />

      <Button title="Next" onPress={handleNext} />
    </ScrollView>
  );
};
```

---

## 🗺️ **Navigation Structure**

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator (Main App)
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#003366',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Browse"
      component={CarsScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Sell"
      component={SellScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Messages"
      component={MessagesScreen}
      options={{
        tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        tabBarBadge: unreadCount > 0 ? unreadCount : null,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// Stack Navigator (Includes Auth + Main App)
const AppNavigator = () => {
  const { currentUser } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!currentUser ? (
          // Auth Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App Screens
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

---

## 📅 **Implementation Timeline (6 Weeks)**

### **Week 1: Project Setup & Authentication**
```
Days 1-2: Initialize Project
  ✅ Create React Native project
  ✅ Setup folder structure
  ✅ Install dependencies
  ✅ Configure Firebase

Days 3-5: Authentication Screens
  ✅ Splash Screen
  ✅ Login Screen
  ✅ Register Screen
  ✅ Email Verification
  ✅ Biometric authentication
```

### **Week 2: Home & Car Browsing**
```
Days 1-2: Navigation Setup
  ✅ Bottom tab navigation
  ✅ Stack navigation
  ✅ Deep linking

Days 3-5: Core Screens
  ✅ Home Screen
  ✅ Cars List Screen
  ✅ Car Details Screen
  ✅ Search Screen (with filters)
```

### **Week 3: Sell Workflow**
```
Days 1-3: Sell Screens
  ✅ Vehicle Type Selection
  ✅ Vehicle Data Entry (7 steps)
  ✅ Image Upload (camera + gallery)
  ✅ Pricing Screen

Days 4-5: Image Handling
  ✅ Camera integration
  ✅ Image picker
  ✅ Image compression
  ✅ Upload to Firebase Storage
```

### **Week 4: Messaging & Profile**
```
Days 1-3: Messaging
  ✅ Messages List Screen
  ✅ Chat Screen (Socket.io)
  ✅ Push notifications (FCM)
  ✅ Unread count badge

Days 4-5: Profile Management
  ✅ Profile Screen
  ✅ Edit Profile Screen
  ✅ My Listings Screen
  ✅ Settings Screen
```

### **Week 5: Advanced Features**
```
Days 1-2: Favorites & Notifications
  ✅ Favorites functionality
  ✅ Notifications List Screen
  ✅ Deep linking from notifications

Days 3-5: Maps & Location
  ✅ Google Maps integration
  ✅ Location picker
  ✅ Seller location on map
  ✅ Nearby cars feature
```

### **Week 6: Polish & Deployment**
```
Days 1-2: Performance Optimization
  ✅ Image lazy loading
  ✅ FlatList optimization
  ✅ Bundle size optimization

Days 3-4: Testing & Bug Fixes
  ✅ Manual testing on iOS
  ✅ Manual testing on Android
  ✅ Fix critical bugs

Day 5: Deployment
  ✅ Generate iOS build
  ✅ Generate Android build
  ✅ Submit to App Store
  ✅ Submit to Play Store
```

---

## 📦 **Build & Deployment**

### **iOS Deployment:**
```bash
# 1. Generate iOS build
cd ios && pod install && cd ..
npx react-native run-ios --configuration Release

# 2. Archive for App Store
# Open Xcode → Product → Archive

# 3. Upload to App Store Connect
# Xcode → Window → Organizer → Upload

# 4. Submit for review
# App Store Connect → TestFlight → Submit
```

### **Android Deployment:**
```bash
# 1. Generate release APK/AAB
cd android
./gradlew bundleRelease

# 2. Sign the bundle
# Use Android Studio or jarsigner

# 3. Upload to Play Console
# https://play.google.com/console

# 4. Submit for review
# Play Console → Production → Create Release
```

### **App Store Listing:**
```
App Name: Globul Cars
Subtitle: Buy & Sell Cars in Bulgaria
Description: (200-character pitch)

Category: Shopping
Price: Free
In-App Purchases: Premium Plans

Screenshots: 6-8 screenshots per device size
App Preview Video: 30-second demo (optional)

Keywords: cars, bulgaria, marketplace, buy, sell
Support URL: https://globul-cars.com/support
Privacy Policy: https://globul-cars.com/privacy
```

---

## ✅ **Success Criteria**

### **Technical Metrics:**
- [x] App launches in <3 seconds
- [x] Crash-free rate 99%+
- [x] Average rating 4.0+ stars
- [x] App size <50 MB
- [x] Battery usage optimized
- [x] Memory usage <200 MB

### **Feature Completeness:**
- [x] All MVP features working
- [x] iOS app approved
- [x] Android app published
- [x] Push notifications functional
- [x] Real-time messaging works
- [x] Image upload works
- [x] Payment integration ready

### **Business Metrics:**
- [x] 1,000+ installs (first month)
- [x] 50%+ user retention (7 days)
- [x] 10%+ conversion (list a car)
- [x] <5% uninstall rate

---

## 🎯 **Platform-Specific Features**

### **iOS-Specific:**
```
✅ Apple Sign-in (required by Apple)
✅ Face ID / Touch ID authentication
✅ 3D Touch (Quick Actions)
✅ iOS Share Sheet
✅ CallKit integration
✅ Apple Maps integration
✅ iMessage app extension (future)
```

### **Android-Specific:**
```
✅ Google Sign-in
✅ Fingerprint authentication
✅ Android Auto support (future)
✅ Home screen widgets
✅ Quick settings tile
✅ Google Maps integration
✅ Android Share Sheet
```

---

## 🚀 **Quick Start Commands**

```bash
# Install dependencies
npm install

# iOS development
npm run ios

# Android development
npm run android

# Run on specific device
npm run ios -- --simulator="iPhone 14 Pro"
npm run android -- --deviceId=<device-id>

# Clean build
npm run clean
cd ios && pod install && cd ..

# Generate APK (Android)
cd android && ./gradlew assembleRelease

# Generate IPA (iOS)
# Use Xcode Archive feature
```

---

**Phase 3 Status:** Ready for Implementation ✅  
**Estimated Effort:** 6 weeks (1.5 developer-months)  
**Expected Outcome:** Production-ready iOS + Android apps on both stores
