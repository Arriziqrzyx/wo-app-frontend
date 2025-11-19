import { createContext, useContext, useState } from "react";

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organization, setOrganization] = useState("YPP"); // default

  return (
    <OrganizationContext.Provider value={{ organization, setOrganization }}>
      {children}
    </OrganizationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrganization = () => useContext(OrganizationContext);
