import React, { useState, useRef } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import {
  useDisclosure,
  Box,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  theme
} from "@chakra-ui/core";

import AddLocationForm from "./AddLocationForm";

import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MARKER_SIZE = 12;

const AddLocationModal = ({ isOpen, onClose, lat, lng, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Add Location</ModalHeader>
      <ModalCloseButton />
      <ModalBody mb={4}>
        <AddLocationForm
          lat={lat}
          lng={lng}
          doLocationAdd={values => {
            onSubmit(values);
            onClose();
          }}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

const Location = ({ lng, lat }) => (
  <Marker longitude={lng} latitude={lat}>
    <svg
      height={MARKER_SIZE}
      viewBox={`0 0 ${MARKER_SIZE} ${MARKER_SIZE}`}
      style={{
        fill: theme.colors.red["500"],
        stroke: "none"
      }}
    >
      <circle cx={MARKER_SIZE / 2} cy={MARKER_SIZE / 2} r={MARKER_SIZE / 2} />
    </svg>
  </Marker>
);

const Crosshair = () => {
  const size = 24;
  const line = { position: "absolute", background: "gray" };

  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      w={`${size}px`}
      h={`${size}px`}
      mt={`-${size / 2}px`}
      ml={`-${size / 2}px`}
    >
      {/* Top */}
      <Box {...line} w="2px" h="40%" left="50%" ml="-1px" />
      {/* Right */}
      <Box {...line} w="40%" h="2px" top="50%" right="0px" mt="-1px" />
      {/* Bottom */}
      <Box {...line} w="2px" h="40%" bottom="0px" left="50%" ml="-1px" />
      {/* Left */}
      <Box {...line} w="40%" h="2px" top="50%" mt="-1px" />
    </Box>
  );
};

export default ({ locations, reportCoordinates, ...props }) => {
  const MAPBOX_TOKEN =
    "pk.eyJ1IjoiY2VyZWFsbGFyY2VueSIsImEiOiJFQVg0NUNJIn0.uvV8uVFFhArIZdu9fVZO5Q";
  const [viewport, setViewport] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1
  });
  const mapRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box position="relative" mt={4} {...props}>
      <ReactMapGL
        {...viewport}
        onViewportChange={setViewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/dark-v10"
        mapboxApiAccessToken={MAPBOX_TOKEN}
        ref={mapRef}
      >
        <Geocoder
          mapRef={mapRef}
          onViewportChange={setViewport}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
        {locations.map(({ lng, lat }) => (
          <Location lng={lng} lat={lat} key={`marker-${lng},${lat}`} />
        ))}
        <Crosshair />
        <Box position="absolute" right="10px" bottom="85px">
          <Text color="white" fontWeight="bold">
            {viewport.latitude.toFixed(5)}, {viewport.longitude.toFixed(5)}
          </Text>
        </Box>
        <Box position="absolute" right="10px" bottom="30px">
          <Button variantColor="blue" onClick={onOpen}>
            Add Location
          </Button>
          <AddLocationModal
            isOpen={isOpen}
            onClose={onClose}
            lat={viewport.latitude}
            lng={viewport.longitude}
            onSubmit={reportCoordinates}
          />
        </Box>
      </ReactMapGL>
    </Box>
  );
};
