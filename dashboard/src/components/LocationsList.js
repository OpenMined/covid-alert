import React from 'react';
import { Heading, List, ListItem, Box, Text } from '@chakra-ui/core';

export default ({ locations, ...props }) => (
  <Box {...props}>
    <Heading as="h3" size="lg">
      Locations
    </Heading>
    {locations.length >= 1 && (
      <List spacing={2} mt={2}>
        {locations.map(({ lng, lat }) => {
          return (
            <ListItem key={`location-${lng},${lat}`}>
              <Text>
                <strong>Longitude:</strong> {lng}
              </Text>
              <Text>
                <strong>Latitude:</strong> {lat}
              </Text>
            </ListItem>
          );
        })}
      </List>
    )}
    {locations.length === 0 && (
      <Text mt={2}>We don't have any locations for this patient yet.</Text>
    )}
  </Box>
);
