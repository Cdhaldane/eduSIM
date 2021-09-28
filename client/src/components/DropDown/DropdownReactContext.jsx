import React, { createContext, useContext, useState } from "react";

export const DropdownReactContext = createContext({test: "hello"});

const DropdownContextProvider = (props) => {

  const [type, setType] = useState("NONE");

  return (
    <DropdownReactContext.Provider value={{type, setType}}>
      {props.children}
    </DropdownReactContext.Provider>
  );
};

export default DropdownContextProvider;
export const useDropdownContext = () => useContext(DropdownReactContext);