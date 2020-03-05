import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button
} from '@chakra-ui/core';

export default () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  const { handleSubmit, errors, register, formState } = useForm();

  return (
    <div>
      <form
        onSubmit={handleSubmit(({ email, password }) => {
          console.log(email, password);
        })}
      >
        <FormControl isInvalid={errors.email}>
          <FormLabel htmlFor="email">Email address</FormLabel>
          <Input
            name="email"
            placeholder="me@example.com"
            ref={register({
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={errors.password}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="password"
            ref={register({
              required: 'Password is required'
            })}
          />
          <FormErrorMessage>
            {errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>
        <Button
          mt={4}
          variantColor="blue"
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};
