import React from 'react';

const TokenContext = React.createContext({
    token: null,
    setToken: () => {},
});

export default TokenContext;
