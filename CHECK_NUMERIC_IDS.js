/**
 * Check if users have numericId field using Firestore REST API
 * Make sure Firestore Emulator is running on port 8081
 */

const http = require('http');

const PROJECT_ID = 'bulgarian-car-marketplace-prod';
const DATABASE_ID = '(default)';

async function fetchUsersFromFirestore() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: `/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/users`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n📊 Checking users in Firestore Emulator...\n');
  
  try {
    const response = await fetchUsersFromFirestore();
    
    if (!response.documents || response.documents.length === 0) {
      console.log('❌ No users found in Firestore');
      process.exit(0);
    }

    const users = response.documents.map(doc => {
      const fields = doc.fields || {};
      return {
        uid: doc.name.split('/').pop(),
        numericId: fields.numericId?.integerValue,
        email: fields.email?.stringValue,
        firstName: fields.firstName?.stringValue,
        lastName: fields.lastName?.stringValue
      };
    });

    const usersWithNumericId = users.filter(u => u.numericId);
    const usersWithoutNumericId = users.filter(u => !u.numericId);

    console.log(`✅ Users WITH numericId: ${usersWithNumericId.length}`);
    usersWithNumericId.slice(0, 15).forEach(u => {
      console.log(`   - [#${u.numericId}] ${u.firstName} ${u.lastName} (${u.email})`);
    });

    console.log(`\n❌ Users WITHOUT numericId: ${usersWithoutNumericId.length}`);
    usersWithoutNumericId.slice(0, 10).forEach(u => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.email})`);
    });

    // Try to find user with numericId = 18
    console.log('\n🔍 Searching for user with numericId = 18...\n');
    const user18 = usersWithNumericId.find(u => u.numericId == 18);
    if (user18) {
      console.log(`✅ Found user #18: ${user18.firstName} ${user18.lastName} (${user18.email})`);
      console.log(`   Firebase UID: ${user18.uid}\n`);
    } else {
      console.log('❌ User #18 not found in database\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n⚠️  Make sure Firestore Emulator is running:');
    console.log('    npm run emulate');
    process.exit(1);
  }
}

main();
