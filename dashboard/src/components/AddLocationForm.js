import React from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Text,
  Stack,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button
} from "@chakra-ui/core";

export default ({ lat, lng, doLocationAdd }) => {
  const { handleSubmit, errors, register, formState } = useForm();

  return (
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
                value: /^(\d{2})\:(\d{2})$/,
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
  );
};
