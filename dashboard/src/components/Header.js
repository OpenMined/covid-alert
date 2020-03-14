import React from "react";
import { Box, Heading, Flex, Text, Button } from "@chakra-ui/core";

const MenuItem = ({ children }) => (
  <Text mt={[4, 0]} mr={6} display="block">
    {children}
  </Text>
);

export default ({ user, doLogout, ...props }) => {
  const [show, setShow] = React.useState(false);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg="blue.500"
      color="white"
      mb={[3, null, 8]}
      {...props}
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg">
          COVID-19 Alert
        </Heading>
      </Flex>

      <Box display={["block", "none"]} onClick={() => setShow(!show)}>
        <svg
          fill="white"
          width="12px"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </Box>
      <Box
        display={[show ? "block" : "none", "flex"]}
        width={["full", "auto"]}
        alignItems="center"
        flexGrow={1}
      >
        <MenuItem>{user.email}</MenuItem>
      </Box>

      <Box display={[show ? "block" : "none", "flex"]} mt={[4, 0]}>
        <Button bg="transparent" border="1px" onClick={doLogout}>
          Logout
        </Button>
      </Box>
    </Flex>
  );
};
