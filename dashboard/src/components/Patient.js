import React from 'react';
import dayjs from 'dayjs';
import { Box, Heading, Text } from '@chakra-ui/core';

export default ({ patient, ...props }) => {
  const dob = dayjs(patient.dob.toDate());
  const years = dayjs().diff(dob, 'year');

  return (
    <Box {...props}>
      <Heading as="h2" size="lg">
        Patient Information
      </Heading>
      <Text mt={2}>
        <strong>Name:</strong> {patient.first_name} {patient.last_name}
      </Text>
      <Text mt={1}>
        <strong>Date of birth:</strong> {dob.format('MMMM D, YYYY')}
      </Text>
      <Text mt={1}>
        <strong>Age:</strong> {years} year{years === 1 ? '' : 's'} old
      </Text>
    </Box>
  );
};
