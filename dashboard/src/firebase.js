// TODO: Restructure as a Firebase factory class
// TODO: Redo subcollection read and writes

import { useState, useEffect } from "react";
import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyCefPrb9I_AGrtPxKgAVWaYGf9GqyfAHYw",
  authDomain: "coronavirus-mapper.firebaseapp.com",
  databaseURL: "https://coronavirus-mapper.firebaseio.com",
  projectId: "coronavirus-mapper",
  storageBucket: "coronavirus-mapper.appspot.com",
  messagingSenderId: "846778604083",
  appId: "1:846778604083:web:719c862db798e9ade16146",
  measurementId: "G-46QNQHGWY9"
};

firebase.initializeApp(config);
firebase.analytics();

export default firebase;

export const useCurrentUser = () => {
  const auth = firebase.auth();
  const [authState, setState] = useState({
    isLoading: true,
    user: null
  });

  useEffect(() => {
    return auth.onAuthStateChanged(authState =>
      setState({ isLoading: false, user: authState })
    );
  }, [auth]);

  return authState;
};

export const login = (email, password, onSuccess, onError) =>
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(onSuccess)
    .catch(error => onError(error));

export const logout = (onSuccess, onError) =>
  firebase
    .auth()
    .signOut()
    .then(onSuccess)
    .catch(error => onError(error));

export const createDocument = (collection, values, onSuccess, onError) =>
  firebase
    .firestore()
    .collection(collection)
    .add({
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      ...values
    })
    .then(doc => onSuccess(doc))
    .catch(error => onError(error));

export const createSubDocument = (
  collection,
  id,
  subcollection,
  values,
  onSuccess,
  onError
) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .collection(subcollection)
    .add({
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      ...values
    })
    .then(doc => onSuccess(doc))
    .catch(error => onError(error));

export const updateDocument = (collection, id, values, onSuccess, onError) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .set(
      {
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        ...values
      },
      { merge: true }
    )
    .then(() => onSuccess())
    .catch(error => onError(error));

export const getDocument = (collection, id, onSuccess, onError) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .get()
    .then(doc => {
      if (doc.exists) {
        onSuccess(doc.data());
      } else {
        onError({ message: "No such document" });
      }
    })
    .catch(error => onError(error));

export const getCollection = (collection, where, onSuccess, onError) =>
  firebase
    .firestore()
    .collection(collection)
    .where(...where)
    .get()
    .then(snapshot => {
      const docs = [];

      snapshot.forEach(doc => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      onSuccess(docs);
    })
    .catch(error => onError(error));

export const getSubCollection = (
  collection,
  id,
  subcollection,
  onSuccess,
  onError
) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .collection(subcollection)
    .get()
    .then(snapshot => {
      const docs = [];

      snapshot.forEach(doc => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      onSuccess(docs);
    })
    .catch(error => onError(error));

export const getLiveCollection = (collection, where, onSuccess, onError) =>
  firebase
    .firestore()
    .collection(collection)
    .where(...where)
    .onSnapshot(
      snapshot => {
        const docs = [];

        snapshot.forEach(doc => {
          docs.push({
            id: doc.id,
            ...doc.data()
          });
        });

        onSuccess(docs);
      },
      error => onError(error)
    );
