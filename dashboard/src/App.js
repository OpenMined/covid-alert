import React from 'react';
import { useToast, Box } from '@chakra-ui/core';
import firebase, { login, logout } from './firebase';
import useAuth from './hooks/useAuth';

import Loader from './components/Loader';
import Login from './Login';
import Main from './Main';

export default () => {
  const toast = useToast();
  const toastProps = {
    duration: 10000,
    isClosable: true,
    position: 'bottom-left'
  };

  const doLogin = (email, password) => {
    login(
      email,
      password,
      () => {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
          status: 'success',
          ...toastProps
        });
      },
      error => {
        toast({
          title: 'Authentication error',
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );
  };

  const doLogout = () => {
    logout(
      () => {
        toast({
          title: 'Success',
          description: 'Logged out successfully',
          status: 'success',
          ...toastProps
        });
      },
      error => {
        toast({
          title: 'Error with logging out',
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );
  };

  const { isLoading, user } = useAuth(firebase.auth());

  return (
    <Box mx="auto" width={['100%']}>
      {isLoading && <Loader />}
      {!user && !isLoading && <Login doLogin={doLogin} />}
      {user && !isLoading && <Main user={user} doLogout={doLogout} />}
    </Box>
  );
};
