import React, { useState, useEffect } from 'react';
import {
  useDisclosure,
  Box,
  Flex,
  Select,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody
} from '@chakra-ui/core';
import CreatePatientForm from '../components/CreatePatientForm';
import Map from '../components/Map';
import Patient from '../components/Patient';
import LocationsList from '../components/LocationsList';
import { createDocument, getCollection } from '../firebase';

// TODO: Add UI for location list
// TODO: Populate list of locations from Firebase
// TODO: RESPONSIVE EVERYTHING

const CreatePatientModal = ({ isOpen, onClose, user, onSuccess, onError }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Add Patient</ModalHeader>
      <ModalCloseButton />
      <ModalBody mb={4}>
        <CreatePatientForm
          user={user}
          doPatientCreate={values =>
            createDocument('patients', values, onSuccess, onError)
          }
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default ({ user, toast, toastProps }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  const getPatients = () => {
    getCollection(
      'patients',
      ['rep_id', '==', user.uid],
      patients => setPatients(patients),
      error => {
        toast({
          title: 'Error with creating a patient',
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );
  };

  useEffect(() => {
    getPatients();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const reportCoordinates = ({ lng, lat }) => {
    console.log('Got the coordinates from the map!', lng, lat);
  };

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <Select
          placeholder="Select a patient"
          mr={4}
          onChange={e => {
            setCurrentPatient(patients.filter(p => p.id === e.target.value)[0]);
          }}
        >
          {patients.map(({ id, first_name, last_name }) => (
            <option value={id} key={id}>
              {first_name} {last_name}
            </option>
          ))}
        </Select>
        <Text mr={4}>or</Text>
        <Button onClick={onOpen}>Add Patient</Button>
      </Flex>
      {currentPatient && (
        <Box>
          <Map
            reportCoordinates={reportCoordinates}
            locations={currentPatient.locations}
          />
          <Flex mt={4}>
            <Patient patient={currentPatient} />
            {/* <LocationsList locations={currentPatient.locations} /> */}
          </Flex>
        </Box>
      )}
      <CreatePatientModal
        isOpen={isOpen}
        onClose={onClose}
        user={user}
        onSuccess={() => {
          onClose();
          getPatients();
        }}
        onError={error =>
          toast({
            title: 'Error with creating a patient',
            description: error.message,
            status: 'error',
            ...toastProps
          })
        }
      />
    </>
  );
};
