import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';

const config = {
  apiKey: 'AIzaSyCefPrb9I_AGrtPxKgAVWaYGf9GqyfAHYw',
  authDomain: 'coronavirus-mapper.firebaseapp.com',
  databaseURL: 'https://coronavirus-mapper.firebaseio.com',
  projectId: 'coronavirus-mapper',
  storageBucket: 'coronavirus-mapper.appspot.com',
  messagingSenderId: '846778604083',
  appId: '1:846778604083:web:719c862db798e9ade16146',
  measurementId: 'G-46QNQHGWY9'
};

// Initialize Firebase
firebase.initializeApp(config);
firebase.analytics();

export default firebase;

export const login = (email, password, onSuccess, onError) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(onSuccess)
    .catch(error => onError(error));
};

export const logout = (onSuccess, onError) => {
  firebase
    .auth()
    .signOut()
    .then(onSuccess)
    .catch(error => onError(error));
};
