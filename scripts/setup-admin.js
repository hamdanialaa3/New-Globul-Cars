// Simple script to create admin user
// Run this with: node scripts/setup-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set up service account)
// For now, we'll use the web SDK approach

console.log('🚀 Setting up admin user...');
console.log('📧 Email: alaa.hamdani@yahoo.com');
console.log('👤 Name: Alaa Hamid');
console.log('📱 Phone: +359879839671');
console.log('🏠 Location: Sofia, Bulgaria');
console.log('📍 Address: Tsar Simeon 77');

console.log('\n📋 Admin User Details:');
console.log('====================');
console.log('Email: alaa.hamdani@yahoo.com');
console.log('Password: Alaa1983');
console.log('Display Name: Alaa Hamid');
console.log('Phone: +359879839671');
console.log('Location: Sofia, Bulgaria');
console.log('Address: Tsar Simeon 77');

console.log('\n🔑 Admin Permissions:');
console.log('====================');
console.log('✅ User Management');
console.log('✅ Car Management');
console.log('✅ Message Management');
console.log('✅ Analytics Access');
console.log('✅ Content Moderation');
console.log('✅ System Administration');
console.log('✅ Data Export/Import');
console.log('✅ User Ban/Delete');
console.log('✅ Content Delete');
console.log('✅ System Settings');

console.log('\n🎯 Next Steps:');
console.log('==============');
console.log('1. Go to: http://localhost:3000/register');
console.log('2. Register with the above credentials');
console.log('3. Login with the same credentials');
console.log('4. You will have full admin access');

console.log('\n✅ Admin user setup instructions completed!');
console.log('🔗 Register at: http://localhost:3000/register');
