// Script to create admin user directly in Firestore
// This bypasses Firebase Auth and creates the user directly

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ",
  authDomain: "studio-448742006-a3493.firebaseapp.com",
  projectId: "studio-448742006-a3493",
  storageBucket: "studio-448742006-a3493.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin user data
const adminUserData = {
  uid: 'admin_alaa_hamid_001',
  email: 'alaa.hamdani@yahoo.com',
  displayName: 'Alaa Hamid',
  phoneNumber: '+359879839671',
  photoURL: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=AH',
  bio: 'System Administrator - Full Access',
  preferredLanguage: 'en',
  location: {
    city: 'Sofia',
    region: 'Sofia',
    postalCode: '1000',
    address: 'Tsar Simeon 77'
  },
  profile: {
    isDealer: true,
    isAdmin: true,
    isSuperAdmin: true,
    companyName: 'Globul Cars Admin',
    taxNumber: 'BG123456789',
    dealerLicense: 'ADMIN-001',
    preferredCurrency: 'EUR',
    timezone: 'Europe/Sofia',
    permissions: {
      canManageUsers: true,
      canManageCars: true,
      canManageMessages: true,
      canManageReports: true,
      canAccessAnalytics: true,
      canModerateContent: true,
      canDeleteUsers: true,
      canBanUsers: true,
      canViewAllData: true,
      canExportData: true,
      canImportData: true,
      canManageSystem: true
    }
  },
  preferences: {
    notifications: true,
    marketingEmails: false,
    language: 'en',
    theme: 'light',
    currency: 'EUR'
  },
  verification: {
    email: {
      verified: true,
      verifiedAt: new Date()
    },
    phone: {
      verified: true,
      verifiedAt: new Date()
    },
    identity: {
      verified: true,
      verifiedAt: new Date()
    },
    business: {
      verified: true,
      verifiedAt: new Date()
    }
  },
  stats: {
    carsListed: 0,
    carsSold: 0,
    totalViews: 0,
    totalMessages: 0,
    rating: 5.0,
    totalRatings: 0
  },
  createdAt: new Date(),
  lastLoginAt: new Date(),
  isVerified: true,
  isActive: true,
  role: 'super_admin',
  accessLevel: 'full',
  permissions: [
    'user_management',
    'car_management',
    'message_management',
    'analytics_access',
    'content_moderation',
    'system_administration',
    'data_export',
    'data_import',
    'user_ban',
    'user_delete',
    'content_delete',
    'system_settings'
  ]
};

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user directly in Firestore...');
    
    // Create user document
    await setDoc(doc(db, 'users', adminUserData.uid), adminUserData);
    console.log('✅ Admin user document created');
    
    // Create admin permissions document
    const adminPermissions = {
      userId: adminUserData.uid,
      role: 'super_admin',
      permissions: adminUserData.permissions,
      accessLevel: 'full',
      grantedBy: 'system',
      grantedAt: new Date(),
      expiresAt: null,
      isActive: true
    };
    
    await setDoc(doc(db, 'admin_permissions', adminUserData.uid), adminPermissions);
    console.log('✅ Admin permissions document created');
    
    // Create system settings document
    const systemSettings = {
      adminUsers: [adminUserData.uid],
      superAdmins: [adminUserData.uid],
      systemVersion: '1.0.0',
      lastUpdated: new Date(),
      updatedBy: adminUserData.uid
    };
    
    await setDoc(doc(db, 'system_settings', 'admin_config'), systemSettings);
    console.log('✅ System settings document created');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminUserData.email);
    console.log('👤 Name:', adminUserData.displayName);
    console.log('📱 Phone:', adminUserData.phoneNumber);
    console.log('🏠 Location:', adminUserData.location.city);
    console.log('🔑 UID:', adminUserData.uid);
    console.log('\n✅ Full admin permissions granted!');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to: http://localhost:3000/register');
    console.log('2. Register with the same email and password');
    console.log('3. The system will recognize you as admin');
    console.log('4. Access admin panel at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
