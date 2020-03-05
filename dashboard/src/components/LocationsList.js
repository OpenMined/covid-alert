import React from 'react';

export default ({ locations }) => (
  <div>
    {locations.map(location => {
      return (
        <div>
          {location.lat}, {location.lng}
        </div>
      );
    })}
  </div>
);
