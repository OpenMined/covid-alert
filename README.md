# COVID Alert

**NOTE: This repo serves as a demo for the work being done by the Private Set Intersection team here at OpenMined.** You can find their repos here:

- https://github.com/OpenMined/psi.js/
- https://github.com/OpenMined/PyPSI/
- https://github.com/OpenMined/KotlinPSI/
- https://github.com/OpenMined/SwiftPSI/

**We are no longer pursuing a production use-case with this application.** Instead we've decided to contribute to another project: https://github.com/corona-trace

## Folder Structure

- `/covidalert` - React Native App for end-users
- `/dashboard` - Create React App with Firebase cloud functions for an API and admin dashboard
- `/designs` - All the related design files
- `/package` - A small NPM package with three functions. One is for turning GPS coordinates into a sectorKey and gridTensor, and two others for allowing us to stringify and parse BitInts in JSON.

## Languages

We have support for the following languages:

- English
- Spanish
- Italian
- Portuguese (Brazilian)
- French
- Russian
- Chinese (Mandarin)
- Arabic
- Hindi

We are open to any pull requests to add support for other languages!

## Getting `app` to work

The dashboard and package directories mostly speak for themselves. To get the app to run, run the following lines:

1. `yarn install` to install dependencies
2. `react-native link` to add assets (fonts and images) to packages
3. If you want to install ios, run `cd ios && pod install && cd ../`
4. `yarn start` for hot reloading
5. iOS: `yarn ios` / Android: `yarn android`

## Technical Explanation

**For anyone wanting to know how we’re currently performing set intersection on the Covid Alert app… this is the description of how the system works. We’re looking to improvements on this process, specifically related to key generation and private set intersection in either Paillier HME or SEAL.**

We’re trying to work on improving key generation speed for iOS and Android using React Native. There’s two places where we’re currently using Paillier HME: on the device to generate keys, encrypt the grid tensor, and then decrypt the result AND on the Node.js serverless function where the actual computation takes place. Here’s the workflow:
1. Mobile phone generates a public/private key for Paillier upon loading the application. Mobile phone also generates a GPS coordinate of the user’s location every 30 seconds while moving.
2. Coordinates are clipped to 2 digits to generate a “sector key” (accurate to 1km x 1km, aka… not very accurate) and then the 3rd digit (accurate to 100m x 100m) is clipped to generate a “grid tensor” (a 10x10 array of 0's with a 1 representing the location of the user).
3. The sector key is left unencrypted since it’s not accurate enough to describe a person. The grid tensor, however, is flattened and then each value is encrypted.
4. The unencypted sector key, the encrypted grid tensor, and the n and g values of the public key are sent to the server.
5. The server receives everything and immediately regenerates the public key (using the provided n and g values, it must be identical to the one generated on the phone). It also then looks up all locations in the database reported in the last 72 hours for the same sector key.
6. If one or more locations are found, we loop through the locations and perform a Paillier multiplication of each of the values (unencrypted) of that location (converted into a grid tensor) and the encrypted grid tensor supplied by the mobile phone. At the end of that matrix multiplication, the values are summed. We then continue to iterate over each location summing them against each other as we go.
7. The final value (all the multiplied sums computed into value) is returned to the mobile phone in encrypted form.
8. The mobile phone decrypts the value. If it’s 0, they’re safe. If it’s 1 or greater, they’re in an overlapped zone of someone with COVID in the last 72 hours and are promptly notified to exit the area calmly and quietly.

That’s the whole workflow from A->Z. Here’s a link to each of the main files involved in this work...
- [Link to React Native code for checking coordinates](https://github.com/OpenMined/covid-alert/blob/master/covidalert/src/check-coords.js)
- [Link to private set intersection code in Node.js](https://github.com/OpenMined/covid-alert/blob/master/dashboard/firebase/functions/index.js)
- [Link to shared library for generating a sector key and grid tensor](https://github.com/OpenMined/covid-alert/blob/master/package/index.js)
- [Link to the current implementation of Paillier we’re using](https://github.com/OpenMined/paillier-pure)

## Acknowledgements

Many people have worked on this application within the OpenMined community, many of which do not show up in the commit history. Here's a brief list (in alphabetical order):

- [Amel Sellami](https://github.com/samelsamel)
- [Andrew Trask](https://github.com/iamtrask)
- [Bennett Farkas](https://github.com/bennettfarkas)
- [Héricles Emanuel](https://github.com/hericlesme)
- [Jonathan Mondragon](https://www.linkedin.com/in/jonathan-acevedo-mondragon)
- [Jose Corbacho](https://github.com/mccorby)
- [Kevin Wang](https://github.com/Kevmo314)
- [Maddie Shang](https://github.com/prtfw)
- [Patrick Cason](https://github.com/cereallarceny)
- [Peter Gaultney](https://github.com/petergaultney)
- [Théo Ryffel](https://github.com/LaRiffle)
- [Thiago Costa Porto](https://github.com/tcp)
- [Vova Manannikov](https://github.com/vvmnnnkv)
