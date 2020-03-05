import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Stack,
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button
} from '@chakra-ui/core';

import firebase from '../firebase';

export default ({ user, doPatientCreate }) => {
  const { handleSubmit, errors, register, formState } = useForm();

  return (
    <form
      onSubmit={handleSubmit(values => {
        const splitDOB = values.dob.split('/').map(i => +i);

        values.dob = firebase.firestore.Timestamp.fromDate(
          new Date(splitDOB[2], splitDOB[1] - 1, splitDOB[0])
        );
        values.locations = [];
        values.rep_id = user.uid;

        doPatientCreate(values);
      })}
    >
      <Stack spacing={4}>
        <FormControl isInvalid={errors.first_name}>
          <FormLabel htmlFor="first_name">First name</FormLabel>
          <Input
            name="first_name"
            placeholder="Johnny"
            ref={register({
              required: 'First name is required'
            })}
          />
          <FormErrorMessage>
            {errors.first_name && errors.first_name.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.last_name}>
          <FormLabel htmlFor="last_name">Last name</FormLabel>
          <Input
            name="last_name"
            placeholder="Johnny"
            ref={register({
              required: 'Last name is required'
            })}
          />
          <FormErrorMessage>
            {errors.last_name && errors.last_name.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.dob}>
          <FormLabel htmlFor="dob">Date of birth</FormLabel>
          <Input
            name="dob"
            placeholder="DD/MM/YYYY"
            ref={register({
              required: 'Date of birth is required',
              pattern: {
                value: /^(\d{2})\/(\d{2})\/(\d{4})$/,
                message: 'Invalid date of birth'
              }
            })}
          />
          <FormErrorMessage>
            {errors.dob && errors.dob.message}
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
