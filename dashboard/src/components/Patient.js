import React from "react";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import {
  Box,
  Heading,
  Text,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button
} from "@chakra-ui/core";

import firebase from "../firebase";

export default ({ patient, isPatientReady, doPatientUpdate, ...props }) => {
  if (isPatientReady) {
    const dob = dayjs(patient.dob.toDate());
    const years = dayjs().diff(dob, "year");

    return (
      <Box {...props}>
        <Heading as="h2" size="lg">
          Patient Information
        </Heading>
        <Text mt={2}>
          <strong>Name:</strong> {patient.first_name} {patient.last_name}
        </Text>
        <Text mt={1}>
          <strong>Date of birth:</strong> {dob.format("MMMM D, YYYY")}
        </Text>
        <Text mt={1}>
          <strong>Age:</strong> {years} year{years === 1 ? "" : "s"} old
        </Text>
        <Text mt={1}>
          <strong>Country:</strong> {patient.country}
        </Text>
      </Box>
    );
  }

  const { handleSubmit, errors, register, formState } = useForm();

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antigua &amp; Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Bosnia &amp; Herzegovina",
    "Botswana",
    "Brazil",
    "British Virgin Islands",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cambodia",
    "Cameroon",
    "Cape Verde",
    "Cayman Islands",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Congo",
    "Cook Islands",
    "Costa Rica",
    "Cote D Ivoire",
    "Croatia",
    "Cruise Ship",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Estonia",
    "Ethiopia",
    "Falkland Islands",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Polynesia",
    "French West Indies",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kuwait",
    "Kyrgyz Republic",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macau",
    "Macedonia",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Nepal",
    "Netherlands",
    "Netherlands Antilles",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Reunion",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Pierre &amp; Miquelon",
    "Samoa",
    "San Marino",
    "Satellite",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "St Kitts &amp; Nevis",
    "St Lucia",
    "St Vincent",
    "St. Lucia",
    "Sudan",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor L'Este",
    "Togo",
    "Tonga",
    "Trinidad &amp; Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks &amp; Caicos",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "Uruguay",
    "Uzbekistan",
    "Venezuela",
    "Vietnam",
    "Virgin Islands (US)",
    "Yemen",
    "Zambia",
    "Zimbabwe"
  ];

  return (
    <Box {...props}>
      <Heading as="h2" size="lg">
        Patient Information
      </Heading>
      <form
        onSubmit={handleSubmit(values => {
          const splitDOB = values.dob.split("/").map(i => +i);

          values.dob = firebase.firestore.Timestamp.fromDate(
            new Date(splitDOB[2], splitDOB[1] - 1, splitDOB[0])
          );

          doPatientUpdate(values);
        })}
      >
        <Stack spacing={4} mt={2}>
          <FormControl isInvalid={errors.first_name}>
            <FormLabel htmlFor="first_name">First name</FormLabel>
            <Input
              name="first_name"
              placeholder="John"
              ref={register({
                required: "First name is required"
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
              placeholder="Smith"
              ref={register({
                required: "Last name is required"
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
                required: "Date of birth is required",
                pattern: {
                  value: /^(\d{2})\/(\d{2})\/(\d{4})$/,
                  message: "Invalid date of birth"
                }
              })}
            />
            <FormErrorMessage>
              {errors.dob && errors.dob.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.country}>
            <FormLabel htmlFor="country">Country</FormLabel>
            <Select
              name="country"
              placeholder="Where are you located?"
              ref={register({
                required: "Country is required",
                validate: value =>
                  countries.includes(value) || "Country must be valid"
              })}
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
            <FormErrorMessage>
              {errors.country && errors.country.message}
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
    </Box>
  );
};
