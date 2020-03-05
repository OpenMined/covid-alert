import React from 'react';
import { Box, Spinner } from '@chakra-ui/core';

export default () => (
  <Box
    position="fixed"
    top={0}
    left={0}
    minWidth="100%"
    minHeight="100%"
    bg="white"
    zIndex={2000}
  >
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      width={12}
      height={12}
    >
      <Spinner
        thickness="4px"
        speed="0.75s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Box>
  </Box>
);
