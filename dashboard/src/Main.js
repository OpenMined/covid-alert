import React, { useState } from 'react';
import { Button } from '@chakra-ui/core';

export default ({ user, doLogout }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [patients, setPatients] = useState([]);

  console.log(user);
  return (
    <div>
      Welcome, {user.email}!<Button onClick={doLogout}>Logout</Button>
    </div>
  );
};
