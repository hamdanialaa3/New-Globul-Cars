// Add More Posts Script
// إضافة المزيد من المنشورات

const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing initialization)
if (!admin.apps.length) {
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'fire-new-globul.appspot.com'
  });
}

const db = admin.firestore();

const morePosts = [
  {
    authorId: 'ivan_dealer_sofia',
    type: 'showcase',
    content: {
      text: 'Just got this beautiful Mercedes-Benz E-Class 2022! Only 15,000 km. Perfect condition. Call for details! 🚗✨ #MercedesBenz #LuxuryCars #Sofia',
      hashtags: ['MercedesBenz', 'LuxuryCars', 'Sofia'],
      carDetails: {
        make: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2022,
        mileage: 15000,
        price: 45000,
        currency: 'EUR'
      }
    },
    visibility: 'public',
    location: { city: 'Sofia', region: 'Sofia Region' },
    engagement: { views: 432, likes: 67, comments: 12, shares: 8, saves: 23 },
    reactions: {},
    status: 'published',
    isPinned: true,
    isFeatured: true
  },
  {
    authorId: 'maria_expert_plovdiv',
    type: 'review',
    content: {
      text: 'Bought my Audi A4 from a dealer in Sofia last month. Great experience! The car is exactly as described. Highly recommend checking the service history before buying. Rating: ⭐⭐⭐⭐⭐ #AudiA4 #BuyingExperience',
      hashtags: ['AudiA4', 'BuyingExperience'],
      rating: 5
    },
    visibility: 'public',
    location: { city: 'Plovdiv', region: 'Plovdiv Region' },
    engagement: { views: 198, likes: 28, comments: 6, shares: 3, saves: 9 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  },
  {
    authorId: 'boris_company_varna',
    type: 'tip',
    content: {
      text: '🔧 Essential car maintenance tips for summer:\n1. Check tire pressure weekly\n2. Replace cabin air filter\n3. Top up coolant levels\n4. Inspect brake pads\nYour car will thank you! #MaintenanceTips #SummerDriving',
      hashtags: ['MaintenanceTips', 'SummerDriving']
    },
    visibility: 'public',
    location: { city: 'Varna', region: 'Varna Region' },
    engagement: { views: 523, likes: 89, comments: 15, shares: 12, saves: 34 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: true
  },
  {
    authorId: 'ivan_dealer_sofia',
    type: 'question',
    content: {
      text: 'Planning to expand our dealership. Which city in Bulgaria has the highest demand for luxury cars? Looking for insights from fellow dealers. #Dealership #BusinessExpansion',
      hashtags: ['Dealership', 'BusinessExpansion']
    },
    visibility: 'public',
    location: { city: 'Sofia', region: 'Sofia Region' },
    engagement: { views: 234, likes: 23, comments: 18, shares: 4, saves: 7 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  },
  {
    authorId: 'maria_expert_plovdiv',
    type: 'tip',
    content: {
      text: '💡 Pro tip: Always test drive on different road types - highway, city streets, and rough roads. This reveals problems that a simple parking lot test won\'t show. #BuyingTips #TestDrive',
      hashtags: ['BuyingTips', 'TestDrive']
    },
    visibility: 'public',
    location: { city: 'Plovdiv', region: 'Plovdiv Region' },
    engagement: { views: 345, likes: 56, comments: 9, shares: 7, saves: 18 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  },
  {
    authorId: 'boris_company_varna',
    type: 'showcase',
    content: {
      text: '🔥 HOT DEAL! BMW X5 2021 - Full options, panoramic roof, leather seats. Was 55,000 EUR, now 52,000 EUR! Limited time offer. #BMW #HotDeal #Varna',
      hashtags: ['BMW', 'HotDeal', 'Varna'],
      carDetails: {
        make: 'BMW',
        model: 'X5',
        year: 2021,
        mileage: 28000,
        price: 52000,
        currency: 'EUR'
      }
    },
    visibility: 'public',
    location: { city: 'Varna', region: 'Varna Region' },
    engagement: { views: 678, likes: 94, comments: 21, shares: 15, saves: 42 },
    reactions: {},
    status: 'published',
    isPinned: true,
    isFeatured: true
  },
  {
    authorId: 'ivan_dealer_sofia',
    type: 'text',
    content: {
      text: 'Beautiful autumn day for a drive! 🍂🚗 The roads through Vitosha mountain are stunning this time of year. Anyone else enjoying the fall colors? #Autumn #Driving #Bulgaria',
      hashtags: ['Autumn', 'Driving', 'Bulgaria']
    },
    visibility: 'public',
    location: { city: 'Sofia', region: 'Sofia Region' },
    engagement: { views: 187, likes: 42, comments: 8, shares: 2, saves: 5 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  },
  {
    authorId: 'maria_expert_plovdiv',
    type: 'question',
    content: {
      text: 'Electric vs Hybrid for city driving in Bulgaria? What are your experiences with charging infrastructure? Looking to make the switch. #Electric #Hybrid #EV',
      hashtags: ['Electric', 'Hybrid', 'EV']
    },
    visibility: 'public',
    location: { city: 'Plovdiv', region: 'Plovdiv Region' },
    engagement: { views: 412, likes: 38, comments: 24, shares: 6, saves: 14 },
    reactions: {},
    status: 'published',
    isPinned: false,
    isFeatured: false
  }
];

async function addMorePosts() {
  console.log('Adding more posts...\n');
  
  try {
    // Get user data
    const users = {
      'ivan_dealer_sofia': null,
      'maria_expert_plovdiv': null,
      'boris_company_varna': null
    };
    
    for (const uid of Object.keys(users)) {
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        users[uid] = userDoc.data();
      }
    }
    
    // Add posts
    let count = 0;
    for (const postData of morePosts) {
      const user = users[postData.authorId];
      if (!user) {
        console.log(`   ⚠️  User not found: ${postData.authorId}`);
        continue;
      }
      
      await db.collection('posts').add({
        ...postData,
        authorInfo: {
          displayName: user.displayName,
          profileImage: user.profileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&size=200&background=FF8F10&color=fff`,
          profileType: user.profileType,
          isVerified: user.verification?.emailVerified || false,
          trustScore: user.verification?.trustScore || 50
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      count++;
      console.log(`   ✅ Created ${postData.type} post by: ${user.displayName}`);
    }
    
    console.log(`\n✅ Successfully added ${count} posts!\n`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('Test now: http://localhost:3000/');
    console.log('═══════════════════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding posts:', error);
    process.exit(1);
  }
}

addMorePosts();

