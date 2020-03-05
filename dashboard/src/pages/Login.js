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

export default ({ doLogin }) => {
  const { handleSubmit, errors, register, formState } = useForm();

  return (
    <form
      onSubmit={handleSubmit(({ email, password }) => {
        doLogin(email, password);
      })}
    >
      <Stack spacing={4}>
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
