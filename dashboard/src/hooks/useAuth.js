import { useState, useEffect } from 'react';

export default auth => {
  const [authState, setState] = useState({
    isLoading: true,
    user: null
  });

  useEffect(() => {
    return auth.onAuthStateChanged(authState =>
      setState({ isLoading: false, user: authState })
    );
  }, [auth]);

  return authState;
};
