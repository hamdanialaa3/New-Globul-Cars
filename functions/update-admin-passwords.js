const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function updateAdminPasswords() {
    const serviceAccountPath = path.resolve(__dirname, '../configs/firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`❌ Service account file not found at ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const auth = admin.auth();
    const emails = [
        'hamdanialaa3@gmail.com',
        'admin@koli.one',
        'admin@example.com'
    ];
    
    const newPassword = 'Alaa1983';

    for (const email of emails) {
        try {
            const userRecord = await auth.getUserByEmail(email);
            await auth.updateUser(userRecord.uid, {
                password: newPassword
            });
            console.log(`✅ Password updated successfully for: ${email}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`⚠️ User ${email} not found. Creating new account...`);
                try {
                    await auth.createUser({
                        email: email,
                        password: newPassword,
                        emailVerified: true
                    });
                    console.log(`✅ User created successfully for: ${email}`);
                } catch (createError) {
                    console.error(`❌ Failed to create user ${email}:`, createError.message);
                }
            } else {
                console.error(`❌ Failed to update password for ${email}:`, error.message);
            }
        }
    }
    console.log('🎉 All tasks completed.');
}

updateAdminPasswords().catch(err => {
    console.error("❌ Fatal Error:", err);
    process.exit(1);
});
