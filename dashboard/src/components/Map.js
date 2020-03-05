import React, { useState, useRef } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import { Box, theme, Button } from '@chakra-ui/core';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MARKER_SIZE = 12;

const Location = ({ lng, lat }) => (
  <Marker longitude={lng} latitude={lat}>
    <svg
      height={MARKER_SIZE}
      viewBox={`0 0 ${MARKER_SIZE} ${MARKER_SIZE}`}
      style={{
        fill: theme.colors.red['500'],
        stroke: 'none'
      }}
    >
      <circle cx={MARKER_SIZE / 2} cy={MARKER_SIZE / 2} r={MARKER_SIZE / 2} />
    </svg>
  </Marker>
);

export default ({ locations, reportCoordinates, ...props }) => {
  const MAPBOX_TOKEN =
    'pk.eyJ1IjoiY2VyZWFsbGFyY2VueSIsImEiOiJFQVg0NUNJIn0.uvV8uVFFhArIZdu9fVZO5Q';
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
