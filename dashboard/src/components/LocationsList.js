import { Box, Heading, List, ListItem, Text } from "@chakra-ui/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

dayjs.extend(relativeTime);

export default ({ locations, ...props }) => {
  const orderedLocations = locations.sort((a, b) =>
    dayjs(a.last_time.toDate()).isBefore(dayjs(b.last_time.toDate())) ? 1 : -1
  );

  return (
    <Box {...props}>
      <Heading as="h3" size="lg">
        Locations
      </Heading>
      {orderedLocations.length >= 1 && (
        <List spacing={2} mt={2}>
          {locations.map(({ lng, lat, last_time }) => {
            const date = dayjs(last_time.toDate());
            const hoursAgo = dayjs().diff(date, "h");

            let finalTime =
              hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;

            if (hoursAgo > 72) {
              finalTime = date.fromNow();
            }

            return (
              <ListItem
                key={`location-${lng},${lat}.${last_time.toDate().getTime()}`}
              >
                <Text>
                  <strong>Time:</strong> {finalTime}
                </Text>
                <Text>
                  <strong>Location:</strong> {lat.toFixed(5)}, {lng.toFixed(5)}
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
};
