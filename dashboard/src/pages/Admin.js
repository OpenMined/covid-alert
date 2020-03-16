import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Heading, Box, Text, Button, Flex } from "@chakra-ui/core";
import { getLiveCollection, updateDocument } from "../firebase";

export default ({ toast, toastProps }) => {
  const [patients, setPatients] = useState([]);

  const getPatients = () =>
    getLiveCollection(
      "patients",
      ["verified", "==", false],
      patients => {
        const readyPatients = [];

        patients.forEach(patient => {
          const hasName =
            patient &&
            patient.hasOwnProperty("first_name") &&
            patient.hasOwnProperty("last_name");
          const hasDOB = patient && patient.hasOwnProperty("dob");
          const hasCountry = patient && patient.hasOwnProperty("country");
          const isPatientReady = hasName && hasDOB && hasCountry;

          if (isPatientReady) readyPatients.push(patient);
        });

        setPatients(readyPatients);
      },
      error => {
        toast({
          title: "Error with loading patient",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );

  const verifyPatient = id => {
    updateDocument(
      "patients",
      id,
      { verified: true },
      () => {
        toast({
          title: "Success",
          description: `Verified patient successfully`,
          status: "success",
          ...toastProps
        });
      },
      error => {
        toast({
          title: "Error with verifying patient",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );
  };

  useEffect(() => {
    getPatients();
  }, []);

  return (
    <>
      <Heading as="h2" size="lg">
        Unverified Patients
      </Heading>
      {patients.length > 0 &&
        patients.map((patient, i) => {
          const dob = dayjs(patient.dob.toDate());

          return (
            <Flex
              key={patient.id}
              borderBottom={i === patients.length - 1 ? "0px" : "1px"}
              borderColor="gray.300"
              py={3}
              flexDirection={["column", null, "row"]}
              alignItems={"center"}
              justifyContent="space-between"
            >
              <Box width={["100%", null, "25%"]}>
                <Text mb={[2, null, 0]}>
                  <strong>Name</strong>
                  <br />
                  {patient.first_name} {patient.last_name}
                </Text>
              </Box>
              <Box width={["100%", null, "25%"]}>
                <Text mb={[2, null, 0]}>
                  <strong>Date of birth</strong>
                  <br />
                  {dob.format("MMMM D, YYYY")}
                </Text>
              </Box>
              <Box width={["100%", null, "25%"]}>
                <Text mb={[2, null, 0]}>
                  <strong>Country</strong>
                  <br />
                  {patient.country}
                </Text>
              </Box>
              <Flex
                width={["100%", null, "25%"]}
                justifyContent={["flex-start", null, "flex-end"]}
              >
                <Button onClick={() => verifyPatient(patient.id)}>
                  Verify
                </Button>
              </Flex>
            </Flex>
          );
        })}
      {patients.length === 0 && <Text mt={2}>No unverified patients</Text>}
    </>
  );
};
