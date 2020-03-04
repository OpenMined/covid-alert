const functions = require('firebase-functions');
   
// import paillier
const paillier = require('paillier-bigint');

exports.helloWorld = functions.https.onRequest((request, response) => {
  console.log(paillier)
  response.send(JSON.stringify({"request":request.query.text}))
  // response.send('ANDREW - FILL THIS IN', request);
});