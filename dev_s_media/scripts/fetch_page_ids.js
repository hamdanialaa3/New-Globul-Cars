const crypto = require('crypto');
const https = require('https');

const ACCESS_TOKEN = "EAAZAS9Y73NscBQlvm2tJI4c58n6yKjDPPRxysd9fC6vB2YpMtDqBTFTEsMFJan6O6Ok6qpVD1Q5kwvjFM6d26nMmsRNvVckc9Hov4ZBj6TMrF4zd80fq8XZBxp7ZBOZAhtoEDJyy1EVR0yietGDFrcrifd05sIWCp03SoGuZBrxPTB0ZCYRYWOCQwY9rnuaqFAYDp3KJSIhhU2yhVLhkjVT4lUvwJ6uZBJzvZCg5ZCsMwaOPV2mTmMsDOSXiU1zhO66cZBv0wwZD";
const APP_SECRET = "e762759ee883c3cbc256779ce0852e90";

const appSecretProof = crypto.createHmac('sha256', APP_SECRET).update(ACCESS_TOKEN).digest('hex');

const url = `https://graph.facebook.com/v19.0/me/accounts?fields=name,id,access_token,instagram_business_account&access_token=${ACCESS_TOKEN}&appsecret_proof=${appSecretProof}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(data);
    });
}).on('error', (err) => {
    console.error("Error: " + err.message);
});
