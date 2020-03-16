import React, { useState, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/core";
import { gps2box } from "gps-sector-grid";

import Map from "../components/Map";
import Patient from "../components/Patient";
import LocationsList from "../components/LocationsList";
import firebase, {
  createSubDocument,
  getSubCollection,
  getDocument,
  updateDocument
} from "../firebase";

export default ({ user, toast, toastProps }) => {
  const [patient, setPatient] = useState(null);
  const [locations, setLocations] = useState([]);

  const getPatient = () =>
    getDocument(
      "patients",
      user.uid,
      patient => setPatient(patient),
      error => {
        toast({
          title: "Error with loading patient",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );

  const updatePatient = values => {
    updateDocument(
      "patients",
      user.uid,
      values,
      () => getPatient(),
      error => {
        toast({
          title: "Error with updating patient",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );
  };

  const getLocations = () =>
    getSubCollection(
      "patients",
      user.uid,
      "locations",
      locations => setLocations(locations),
      error => {
        toast({
          title: "Error with loading your locations",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );

  const reportCoordinates = values => {
    const { sectorKey } = gps2box(values.lat, values.lng);
    values["sector_key"] = sectorKey;

    const splitDate = values.date.split("/");
    const splitTime = values.time.split(":");
    values["last_time"] = firebase.firestore.Timestamp.fromDate(
      new Date(
        splitDate[2],
        splitDate[1] - 1,
        splitDate[0],
        splitTime[0],
        splitTime[1],
        0
      )
    );

    delete values.date;
    delete values.time;

    createSubDocument(
      "patients",
      user.uid,
      "locations",
      values,
      () => {
        toast({
          title: "Success",
          description: `Added a location successfully`,
          status: "success",
          ...toastProps
        });

        getLocations();
      },
      error => {
        toast({
          title: "Error with creating a location",
          description: error.message,
          status: "error",
          ...toastProps
        });
      }
    );
  };

  useEffect(() => {
    getPatient();
  }, []);

  useEffect(() => {
    if (patient) {
      getLocations();
    }
  }, [patient]);

  const hasName =
    patient &&
    patient.hasOwnProperty("first_name") &&
    patient.hasOwnProperty("last_name");
  const hasDOB = patient && patient.hasOwnProperty("dob");
  const hasCountry = patient && patient.hasOwnProperty("country");
  const isPatientReady = hasName && hasDOB && hasCountry;

  return (
    <>
      {patient && (
        <Box>
          {locations && isPatientReady && (
            <Map
              height={[400, 600]}
              reportCoordinates={reportCoordinates}
              locations={locations}
            />
          )}
          <Flex mt={4} flexDirection={["column", "row"]}>
            <Patient
              patient={patient}
              isPatientReady={isPatientReady}
              doPatientUpdate={updatePatient}
              mr={[0, 8]}
            />
            {locations && isPatientReady && (
              <LocationsList locations={locations} mt={[4, 0]} />
            )}
          </Flex>
        </Box>
      )}
    </>
  );
};
