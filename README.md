# COVID Alert

- `/app` - Expo React Native App for end-users
- `/dashboard` - Create React App with Firebase cloud functions for an API and admin dashboard
- `/designs` - All the related design files
- `/package` - A small NPM package with two functions. One is for turning GPS coordinates into a sector, row, and column. The other is for turning a row and column into a 0/1 tensor.

## Languages

We have support for the following languages:

- English
- Spanish
- Portuguese (Brazilian)
- French
- Russian
- Chinese (Mandarin)
- Arabic

We are open to any pull requests to add support for other languages!

## Development environment

1. Please install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. then install Node 12 with `nvm install 12`, or some other recent version of Node, ideally an LTS.
3. `nvm use 12` (or your preferred, recent version)
4. `npm -g install yarn react-native-cli`

### Android prep

1. Open the `app/android` folder in Android Studio 3.6+. It should prompt you to install the NDK. This is required for `nodejs-nodemobile`, which is itself required for `paillier-bigint`.

## Building/running the app

The dashboard and package directories mostly speak for themselves. To get the app to run, run the following lines:

1. `yarn install`
2. If you want to install ios, run `cd ios && pod install && cd ../`
3. To start the app -- iOS: `yarn ios` / Android: `yarn android`

## Acknowledgements

Many people have worked on this application within the OpenMined community, many of which do not show up in the commit history. Here's a brief list (in alphabetical order):

- [Amel Sellami](https://github.com/samelsamel)
- [Andrew Trask](https://github.com/iamtrask)
- [Bennett Farkas](https://github.com/bennettfarkas)
- [Héricles Emanuel](https://github.com/hericlesme)
- [Jose Corbacho](https://github.com/mccorby)
- [Maddie Shang](https://github.com/prtfw)
- [Patrick Cason](https://github.com/cereallarceny)
- [Théo Ryffel](https://github.com/LaRiffle)
- [Thiago Costa Porto](https://github.com/tcp)
- [Vova Manannikov](https://github.com/vvmnnnkv)
