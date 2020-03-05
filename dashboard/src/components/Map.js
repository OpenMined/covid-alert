import React, { Component } from 'react';
import { Box } from '@chakra-ui/core';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2VyZWFsbGFyY2VueSIsImEiOiJFQVg0NUNJIn0.uvV8uVFFhArIZdu9fVZO5Q';

// TODO: Do proper styles for map
// TODO: Add address and business search box
// TODO: Add ability to drop pin
// TODO: Report coords on drop of a pin
// TODO: List all pins on the map

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lng: 5,
      lat: 34,
      zoom: 2
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });

    map.on('move', () => {
      const { lng, lat } = map.getCenter();
      const zoom = map.getZoom();

      this.props.reportCoordinates({ lng, lat });

      this.setState({
        lng,
        lat,
        zoom
      });
    });
  }

  render() {
    const { lng, lat, zoom } = this.state;

    return (
      <Box position="relative" mt={4}>
        <div
          style={{
            display: 'inline-block',
            position: 'absolute',
            top: 0,
            left: 0,
            margin: '12px',
            backgroundColor: '#404040',
            color: '#ffffff',
            zIndex: 10,
            padding: '6px',
            fontWeight: 'bold'
          }}
        >
          Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom:{' '}
          {zoom.toFixed(4)}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            zIndex: 1
          }}
          ref={el => (this.mapContainer = el)}
        />
      </Box>
    );
  }
}
