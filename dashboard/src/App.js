import React, { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/core';

import Login from './Login';
import Main from './Main';

export default () => {
  const [user, setUser] = useState(null);

  const toast = useToast();

  useEffect(() => {
    const firebase = window.firebase;
    const firebaseConfig = {
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
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();

    // Check user auth status
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  const doLogin = (email, password) => {
    window.firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        toast({
          title: 'Authentication error',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'bottom-left'
        });
      });
  };

  return (
    <div className="App">
      {!user && <Login doLogin={doLogin} />}
      {user && <Main user={user} />}
    </div>
  );
};
