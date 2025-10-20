// scripts/seed-social-data.js
// Seed data for social features testing
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'fire-new-globul.appspot.com'
});

const db = admin.firestore();

// ==================== SEED DATA ====================

const seedUsers = [
  {
    uid: 'ivan_dealer_sofia',
    displayName: 'Ivan Petrov',
    email: 'ivan@example.com',
    profileType: 'dealer',
    accountType: 'business',
    location: { city: 'Sofia', region: 'Sofia Region' },
    verification: { emailVerified: true, phoneVerified: true, trustScore: 85 },
    stats: { followers: 127, following: 45, listings: 23, posts: 5 },
    isOnline: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    uid: 'maria_expert_plovdiv',
    displayName: 'Maria Dimitrova',
    email: 'maria@example.com',
    profileType: 'private',
    accountType: 'individual',
    location: { city: 'Plovdiv', region: 'Plovdiv Region' },
    verification: { emailVerified: true, phoneVerified: false, trustScore: 72 },
    stats: { followers: 58, following: 89, listings: 8, posts: 12 },
    isOnline: true,
    createdAt: admin.firestore.Timestamp.now()
  },
  {
    uid: 'boris_company_varna',
    displayName: 'Boris Motors Ltd',
    email: 'boris@example.com',
    profileType: 'company',
    accountType: 'business',
    location: { city: 'Varna', region: 'Varna Region' },
    verification: { emailVerified: true, phoneVerified: true, trustScore: 94 },
    stats: { followers: 342, following: 12, listings: 67, posts: 3 },
    isOnline: false,
    createdAt: admin.firestore.Timestamp.now()
  }
];

const seedPosts = [
  {
    authorId: 'ivan_dealer_sofia',
    type: 'tip',
    content: {
      text: 'Best time to buy a used BMW in Bulgaria is during winter months. Prices drop 10-15%! #BMWTips #BulgariaCarMarket',
      hashtags: ['BMWTips', 'BulgariaCarMarket']
    },
    visibility: 'public',
    location: { city: 'Sofia', region: 'Sofia Region' },
    engagement: { views: 245, likes: 34, comments: 8, shares: 5, saves: 12 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  },
  {
    authorId: 'maria_expert_plovdiv',
    type: 'question',
    content: {
      text: 'Anyone has experience with importing cars from Germany? Looking for advice on the process. #Import #Advice',
      hashtags: ['Import', 'Advice']
    },
    visibility: 'public',
    location: { city: 'Plovdiv', region: 'Plovdiv Region' },
    engagement: { views: 156, likes: 12, comments: 15, shares: 2, saves: 8 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  }
];

const seedConsultations = [
  {
    requesterId: 'maria_expert_plovdiv',
    expertId: 'ivan_dealer_sofia',
    category: 'buying_advice',
    topic: 'Should I buy a BMW X5 2020 with 45,000 km?',
    description: 'Found a BMW X5 in Sofia for €42,000. Is this a good price? Any known issues with this year?',
    urgency: 'medium',
    status: 'in_progress',
    messagesCount: 3,
    isPublic: false
  }
];

// ==================== SEED FUNCTION ====================

async function seedData() {
  console.log('Starting seed data creation...\n');
  
  try {
    // 1. Seed Users
    console.log('1. Creating users... [████░░░░░░] 10%');
    for (const userData of seedUsers) {
      const userRef = db.collection('users').doc(userData.uid);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        await userRef.set({
          ...userData,
          profileImage: { url: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName)}&size=200&background=FF8F10&color=fff` }
        });
        console.log(`   ✅ Created user: ${userData.displayName}`);
      } else {
        console.log(`   ⏭️  User exists: ${userData.displayName}`);
      }
    }
    console.log('   Users complete! [████████░░] 80%\n');
    
    // 2. Seed Posts
    console.log('2. Creating posts... [████████░░] 80%');
    for (const postData of seedPosts) {
      const user = seedUsers.find(u => u.uid === postData.authorId);
      if (!user) continue;
      
      await db.collection('posts').add({
        ...postData,
        authorInfo: {
          displayName: user.displayName,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&size=200&background=FF8F10&color=fff`,
          profileType: user.profileType,
          isVerified: user.verification.emailVerified,
          trustScore: user.verification.trustScore
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`   ✅ Created post by: ${user.displayName}`);
    }
    console.log('   Posts complete! [█████████░] 90%\n');
    
    // 3. Seed Consultations
    console.log('3. Creating consultations... [█████████░] 90%');
    for (const consultData of seedConsultations) {
      const requester = seedUsers.find(u => u.uid === consultData.requesterId);
      const expert = seedUsers.find(u => u.uid === consultData.expertId);
      
      if (!requester || !expert) continue;
      
      await db.collection('consultations').add({
        ...consultData,
        requesterInfo: {
          displayName: requester.displayName,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(requester.displayName)}&size=200&background=FF8F10&color=fff`,
          location: requester.location.city
        },
        expertInfo: {
          displayName: expert.displayName,
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.displayName)}&size=200&background=FF8F10&color=fff`,
          profileType: expert.profileType,
          rating: 4.7
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`   ✅ Created consultation: ${consultData.topic.substring(0, 50)}...`);
    }
    console.log('   Consultations complete! [██████████] 100%\n');
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SEED DATA CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Created:');
    console.log(`  • ${seedUsers.length} users`);
    console.log(`  • ${seedPosts.length} posts`);
    console.log(`  • ${seedConsultations.length} consultations`);
    console.log('');
    console.log('Test now:');
    console.log('  • http://localhost:3000/users - See bubbles!');
    console.log('  • http://localhost:3000/ - See posts!');
    console.log('  • http://localhost:3000/profile - See consultations!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedData();

