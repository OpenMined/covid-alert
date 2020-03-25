import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text
} from "@chakra-ui/core";
import JSZip from "jszip";
import React from "react";
import { useForm } from "react-hook-form";

async function* toPlaceVisits(takeout) {
  const zip = await JSZip.loadAsync(takeout);
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER"
  ];
  const to = new Date();
  const from = new Date(new Date().getTime() - 86400 * 1000 * 14);
  const filenames = new Set([
    `${from.getFullYear()}_${months[from.getMonth()]}`,
    `${to.getFullYear()}_${months[to.getMonth()]}`
  ]);
  for (const filename of filenames) {
    const content = await zip
      .folder("Takeout")
      .folder("Location History")
      .folder("Semantic Location History")
      .folder(filename.substring(0, 4))
      .file(`${filename}.json`)
      .async("text");
    yield* JSON.parse(content)
      ["timelineObjects"].filter(object => "placeVisit" in object)
      .map(object => object["placeVisit"])
      .filter(
        placeVisit =>
          Number(placeVisit["duration"]["startTimestampMs"]) > from.getTime()
      );
  }
}

export default ({ lat, lng, doLocationAdd }) => {
  const { handleSubmit, errors, register, formState } = useForm();

  const handleTakeout = async files => {
    const locations = [];
    for (const file of files) {
      // now - two weeks
      for await (const placeVisit of toPlaceVisits(file)) {
        const date = new Date(
          Number(placeVisit["duration"]["startTimestampMs"])
        );

        const pad = x => x.toString().padStart(2, "0");

        const day = pad(date.getUTCDate());
        const month = pad(date.getUTCMonth());
        const year = date.getUTCFullYear();
        const hour = pad(date.getUTCHours());
        const minute = pad(date.getUTCMinutes());

        const lat = placeVisit["location"]["latitudeE7"] / 1e7;
        const lng = placeVisit["location"]["longitudeE7"] / 1e7;

        // Skip already marked lat/lng pairs as the map will complain.

        locations.push({
          lat,
          lng,
          date: `${day}/${month}/${year}`,
          time: `${hour}:${minute}`
        });
      }
    }
    doLocationAdd(locations);
  };

  return (
    <React.Fragment>
      <Box>
        <Text>Import from Google Takeout</Text>
        <input
          type="file"
          accept="application/zip"
          onChange={e => handleTakeout(e.target.files)}
        />
      </Box>
      <hr />
      <Text>Manually enter a location</Text>
      <form
        onSubmit={handleSubmit(values => {
          values.lat = lat;
          values.lng = lng;

          doLocationAdd(values);
        })}
      >
        <Stack spacing={4}>
          <Box>
            <Text fontWeight="bold">Latitude</Text>
            <Text>{lat.toFixed(5)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Longitude</Text>
            <Text>{lng.toFixed(5)}</Text>
          </Box>
          <FormControl isInvalid={errors.date}>
            <FormLabel htmlFor="date">Last estimated date</FormLabel>
            <Input
              name="date"
              placeholder="DD/MM/YYYY"
              ref={register({
                required: "Date is required",
                pattern: {
                  value: /^(\d{2})\/(\d{2})\/(\d{4})$/,
                  message: "Invalid date"
                }
              })}
            />
            <FormErrorMessage>
              {errors.date && errors.date.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.time}>
            <FormLabel htmlFor="time">Last estimated time</FormLabel>
            <Input
              name="time"
              placeholder="HH:MM"
              ref={register({
                required: "Time is required",
                pattern: {
                  value: /^(\d{2}):(\d{2})$/,
                  message: "Invalid time"
                }
              })}
            />
            <FormErrorMessage>
              {errors.time && errors.time.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            variantColor="blue"
            isLoading={formState.isSubmitting}
            type="submit"
          >
            Submit
          </Button>
        </Stack>
      </form>
    </React.Fragment>
  );
};
