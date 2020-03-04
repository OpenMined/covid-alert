const functions = require('firebase-functions');

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('ANDREW - FILL THIS IN', request);
});
