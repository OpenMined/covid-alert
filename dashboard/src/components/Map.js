import React, { useState, useRef } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import { Box, theme, Button } from "@chakra-ui/core";

import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MARKER_SIZE = 12;

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
      width={`${size}px`}
      height={`${size}px`}
      marginTop={`-${size / 2}px`}
      marginLeft={`-${size / 2}px`}
    >
      {/* Top */}
      <Box {...line} width="2px" height="40%" left="50%" marginLeft="-1px" />
      {/* Right */}
      <Box
        {...line}
        width="40%"
        height="2px"
        top="50%"
        right="0px"
        marginTop="-1px"
      />
      {/* Bottom */}
      <Box
        {...line}
        width="2px"
        height="40%"
        bottom="0px"
        left="50%"
        marginLeft="-1px"
      />
      {/* Left */}
      <Box {...line} width="40%" height="2px" top="50%" marginTop="-1px" />
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
        <Box position="absolute" right="10px" bottom="30px">
          <Button
            variantColor="blue"
            onClick={() =>
              reportCoordinates({
                lat: viewport.latitude,
                lng: viewport.longitude
              })
            }
          >
            Add Location
          </Button>
        </Box>
      </ReactMapGL>
    </Box>
  );
};
