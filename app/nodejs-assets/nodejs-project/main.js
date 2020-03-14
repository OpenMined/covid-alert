// Rename this sample file to main.js to use on your project.
// The main.js file will be overwritten in updates/reinstalls.

var rn_bridge = require("rn-bridge");

var paillier = require("paillier-bigint");

// Echo every message received from react-native.
rn_bridge.channel.on("message", msg => {
  if (msg === "generateRandomKeys") {
    console.log("generating a random keypair");
    paillier
      .generateRandomKeys()
      .then(key => {
        const publicKeyN = key.publicKey.n.toString();
        console.log(key.publicKey);
        rn_bridge.channel.send(JSON.stringify({ publicKeyN }));
      })
      .catch(err => rn_bridge.channel.send("Failed with error: " + err));
  } else {
    rn_bridge.channel.send(msg);
  }
});

// Inform react-native node is initialized.
rn_bridge.channel.send("Node was initialized.");
