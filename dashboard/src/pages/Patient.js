import { Box, Flex } from "@chakra-ui/core";
import { gps2box } from "gps-sector-grid";
import React, { useEffect, useState } from "react";
import LocationsList from "../components/LocationsList";
import Map from "../components/Map";
import Patient from "../components/Patient";
import firebase, {
  createSubDocuments,
  getDocument,
  getSubCollection,
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

  const convertValue = value => {
    const { sectorKey } = gps2box(value.lat, value.lng);
    value["sector_key"] = sectorKey;

    const splitDate = value.date.split("/");
    const splitTime = value.time.split(":");
    value["last_time"] = firebase.firestore.Timestamp.fromDate(
      new Date(
        splitDate[2],
        splitDate[1] - 1,
        splitDate[0],
        splitTime[0],
        splitTime[1],
        0
      )
    );

    delete value.date;
    delete value.time;

    return value;
  };

  const reportCoordinates = values => {
    if (!Array.isArray(values)) {
      reportCoordinates([values]);
      return;
    }
    // Do a batch write.
    createSubDocuments(
      "patients",
      user.uid,
      "locations",
      values.map(value => convertValue(value)),
      () => {
        toast({
          title: "Success",
          description:
            values.length == 1
              ? `Added a location successfully`
              : "Added locations successfully",
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
