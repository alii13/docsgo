import React, { createContext, useState } from "react";
export const StoreContext = createContext();

function StoreContextProvider(props) {
  const [name, setName] = useState("");
  return (
    <StoreContext.Provider value={{ name, setName }}>
      {props.children}
    </StoreContext.Provider>
  );
}

export default StoreContextProvider;
