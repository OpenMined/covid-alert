import React, { useState } from 'react';
import {
  useDisclosure,
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
import { createDocument } from '../firebase';

// TODO: Add UI for patient information
// TODO: Add UI for location list
// TODO: Populate list of my patients from Firebase
// TODO: Populate list of locations from Firebase
// TODO: RESPONSIVE EVERYTHING

const CreatePatientModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Add Patient</ModalHeader>
      <ModalCloseButton />
      <ModalBody mb={4}>
        <CreatePatientForm
          doPatientCreate={values =>
            createDocument(
              'patients',
              values,
              // TODO: Handle this?
              doc => console.log(doc),
              // TODO: Do toast here
              error => console.log(error)
            )
          }
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default () => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPatientLocations, setCurrentPatientLocations] = useState([]);

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
          onChange={e => setCurrentPatient(e.target.value)}
        >
          <option value="option1">Option 1</option>
        </Select>
        <Text mr={4}>or</Text>
        <Button onClick={onOpen}>Add Patient</Button>
      </Flex>
      <Map
        reportCoordinates={reportCoordinates}
        locations={currentPatientLocations}
      />
      {/* <Flex>
        <Patient patient={currentPatient} />
        <LocationsList locations={currentPatientLocations} />
      </Flex> */}
      <CreatePatientModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
