const crypto = require('crypto');
const axios = require('axios');

const app_secret = 'e762759ee883c3cbc256779ce0852e90';
const token = 'EAAZAS9Y73NscBRHVoEnmKpDbuJHvDR8HLTUtriOyR8YcIhZBGd03UDp1RK1fRxkQlnUsIFFp2qL9rgn6jHgDrQxp0wzvvFZBO1scMo0vHFGr662eqprYNhuv8ZBgb0SbhSlI7gCUVSwOBqtqZCgEWlrtrNTjVDLDzWiCugUZBjU5ui4qwtD9ZASWsGYjcPRopqPMLr1zN5YjNKXhDWGl7KbZCYTNefFwMnlW6Mp4X1nK2yzwqseJTglALGFTQgZDZD';
const appsecret_proof = crypto.createHmac('sha256', app_secret).update(token).digest('hex');

const url = `https://graph.facebook.com/v24.0/me/accounts?access_token=${token}&appsecret_proof=${appsecret_proof}`;

axios.get(url)
    .then(res => console.log(JSON.stringify(res.data, null, 2)))
    .catch(err => console.log(err.response ? err.response.data : err.message));
