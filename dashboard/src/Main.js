import React from 'react';

export default ({ user }) => {
  console.log(user);
  return <div>Welcome, {user.email}!</div>;
};
