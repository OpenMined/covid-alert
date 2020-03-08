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
import { gps2box } from 'gps-sector-grid';

import CreatePatientForm from '../components/CreatePatientForm';
import Map from '../components/Map';
import Patient from '../components/Patient';
import LocationsList from '../components/LocationsList';
import {
  createDocument,
  getCollection,
  createSubDocument,
  getSubCollection
} from '../firebase';

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
  const [locations, setLocations] = useState([]);

  const getPatients = () =>
    getCollection(
      'patients',
      ['rep_id', '==', user.uid],
      patients => setPatients(patients),
      error => {
        toast({
          title: 'Error with loading your patients',
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );

  const getLocations = () =>
    getSubCollection(
      'patients',
      currentPatient.id,
      'locations',
      locations => setLocations(locations),
      error => {
        toast({
          title: "Error with loading that patient's locations",
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );

  useEffect(() => {
    getPatients();
  }, []);

  useEffect(() => {
    if (currentPatient) {
      getLocations();
    }
  }, [currentPatient]);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const reportCoordinates = values => {
    const { sectorKey } = gps2box(values.lat, values.lng);
    values['sector_key'] = sectorKey;

    createSubDocument(
      'patients',
      currentPatient.id,
      'locations',
      values,
      () => {
        toast({
          title: 'Success',
          description: `Added a location for ${currentPatient.first_name} ${currentPatient.last_name} successfully`,
          status: 'success',
          ...toastProps
        });

        getLocations();
      },
      error => {
        toast({
          title: 'Error with creating a location for that patient',
          description: error.message,
          status: 'error',
          ...toastProps
        });
      }
    );
  };

  const setPatientById = id =>
    setCurrentPatient(patients.filter(p => p.id === id)[0]);

  return (
    <>
      <Flex
        flexDirection={['column', null, 'row']}
        justifyContent="space-between"
        alignItems="center"
      >
        {patients.length > 0 && (
          <Select
            placeholder="Select a patient"
            mr={[0, null, 4]}
            value={currentPatient ? currentPatient.id : ''}
            onChange={e => setPatientById(e.target.value)}
          >
            {patients.map(({ id, first_name, last_name }) => (
              <option value={id} key={id}>
                {first_name} {last_name}
              </option>
            ))}
          </Select>
        )}
        {patients.length > 0 && (
          <Text display={['none', null, 'block']} mr={4}>
            or
          </Text>
        )}
        <Button
          onClick={onOpen}
          mt={[4, null, 0]}
          width={['100%', null, 'inherit']}
        >
          Add Patient
        </Button>
      </Flex>
      {currentPatient && (
        <Box>
          <Map
            height={[400, 600]}
            reportCoordinates={reportCoordinates}
            locations={locations}
          />
          <Flex mt={4} flexDirection={['column', 'row']}>
            <Patient patient={currentPatient} mr={[0, 8]} />
            <LocationsList locations={locations} mt={[4, 0]} />
          </Flex>
        </Box>
      )}
      <CreatePatientModal
        isOpen={isOpen}
        onClose={onClose}
        user={user}
        onSuccess={() => {
          onClose();

          toast({
            title: 'Success',
            description: 'Created a patient successfully',
            status: 'success',
            ...toastProps
          });

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
