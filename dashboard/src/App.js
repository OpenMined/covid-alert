import React, { useEffect } from "react";
import { useToast, Box, Text } from "@chakra-ui/core";

import { login, logout, useCurrentUser } from "./firebase";
import Loader from "./components/Loader";
import Header from "./components/Header";
import Login from "./pages/Login";
import Patient from "./pages/Patient";
import Admin from "./pages/Admin";

export default () => {
  const toast = useToast();
  const toastProps = {
    duration: 10000,
    isClosable: true,
    position: "bottom-left"
  };

  const doLogin = (email, password) => {
    login(
      email,
      password,
      () => {
        toast({
          title: "Success",
          description: "Logged in successfully",
          status: "success",
          ...toastProps
        });
      },
      error => {
        toast({
          title: "Authentication error",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );
  };

  const doLogout = () => {
    logout(
      () => {
        toast({
          title: "Success",
          description: "Logged out successfully",
          status: "success",
          ...toastProps
        });
      },
      error => {
        toast({
          title: "Error with logging out",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );
  };

  const { isLoading, user } = useCurrentUser();
  const isUserAdmin = user && /^[\w.+-]+@(un\.org|who\.int)$/.test(user.email);

  useEffect(() => {
    if (user && !user.emailVerified) {
      user
        .sendEmailVerification()
        .then(() => {
          toast({
            title: "Success",
            description: "Verification email sent, please check your email",
            status: "success",
            ...toastProps
          });
        })
        .catch(error => {
          toast({
            title: "Error with sending verification email",
            description: error.message,
            status: "error",
            ...toastProps
          });
        });
    }
  }, [user]);

  return (
    <>
      {user && !isLoading && <Header user={user} doLogout={doLogout} />}
      <Box mx="auto" width={["100%", null, 720, 960, 1200]} px={3} pb={6}>
        {isLoading && <Loader />}
        {!isLoading && (
          <>
            {!user && (
              <Box
                pt={[3, null, 8]}
                width={[null, null, "75%", "50%"]}
                mx="auto"
              >
                <Login doLogin={doLogin} />
              </Box>
            )}
            {user && (
              <>
                {!user.emailVerified && (
                  <Text>Please check your email for a verification email.</Text>
                )}
                {!isUserAdmin && user.emailVerified && (
                  <Patient user={user} toast={toast} toastProps={toastProps} />
                )}
                {isUserAdmin && user.emailVerified && (
                  <Admin toast={toast} toastProps={toastProps} />
                )}
              </>
            )}
          </>
        )}
      </Box>
    </>
  );
};
