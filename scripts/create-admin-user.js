// Script to create admin user with full permissions
// This script creates a permanent admin user for the system

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin user data
const adminUserData = {
  email: 'alaa.hamdani@yahoo.com',
  password: 'Alaa1983',
  displayName: 'Alaa Hamid',
  phoneNumber: '+359879839671',
  location: {
    city: 'Sofia',
    region: 'Sofia',
    postalCode: '1000',
    address: 'Tsar Simeon 77'
  }
};

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      adminUserData.email, 
      adminUserData.password
    );
    
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    // Update user profile
    await updateProfile(userCredential.user, {
      displayName: adminUserData.displayName,
      photoURL: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=AH'
    });
    
    console.log('✅ User profile updated');
    
    // Create admin user document in Firestore
    const adminUser = {
      uid: userCredential.user.uid,
      email: adminUserData.email,
      displayName: adminUserData.displayName,
      phoneNumber: adminUserData.phoneNumber,
      photoURL: 'https://via.placeholder.com/150/4267B2/FFFFFF?text=AH',
      bio: 'System Administrator - Full Access',
      preferredLanguage: 'en',
      location: adminUserData.location,
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
    
    // Save admin user to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), adminUser);
    
    console.log('✅ Admin user document created in Firestore');
    
    // Create admin permissions document
    const adminPermissions = {
      userId: userCredential.user.uid,
      role: 'super_admin',
      permissions: adminUser.permissions,
      accessLevel: 'full',
      grantedBy: 'system',
      grantedAt: new Date(),
      expiresAt: null, // Never expires
      isActive: true
    };
    
    await setDoc(doc(db, 'admin_permissions', userCredential.user.uid), adminPermissions);
    
    console.log('✅ Admin permissions document created');
    
    // Create system settings document
    const systemSettings = {
      adminUsers: [userCredential.user.uid],
      superAdmins: [userCredential.user.uid],
      systemVersion: '1.0.0',
      lastUpdated: new Date(),
      updatedBy: userCredential.user.uid
    };
    
    await setDoc(doc(db, 'system_settings', 'admin_config'), systemSettings);
    
    console.log('✅ System settings updated');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('📧 Email:', adminUserData.email);
    console.log('👤 Name:', adminUserData.displayName);
    console.log('📱 Phone:', adminUserData.phoneNumber);
    console.log('🏠 Location:', adminUserData.location.city);
    console.log('🔑 UID:', userCredential.user.uid);
    console.log('\n✅ Full admin permissions granted!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists. Updating permissions...');
      
      // If user exists, update their permissions
      try {
        const adminPermissions = {
          userId: auth.currentUser?.uid,
          role: 'super_admin',
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
          ],
          accessLevel: 'full',
          grantedBy: 'system',
          grantedAt: new Date(),
          expiresAt: null,
          isActive: true
        };
        
        await setDoc(doc(db, 'admin_permissions', auth.currentUser?.uid), adminPermissions);
        console.log('✅ Admin permissions updated for existing user');
      } catch (updateError) {
        console.error('❌ Error updating permissions:', updateError);
      }
    }
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
