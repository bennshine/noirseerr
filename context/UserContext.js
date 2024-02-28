import React, { createContext, useState } from 'react';

// Create a context for the user details
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userDetails, setUserDetails] = useState(null);

    return (
        <UserContext.Provider value={{ userDetails, setUserDetails }}>
            {children}
        </UserContext.Provider>
    );
};
