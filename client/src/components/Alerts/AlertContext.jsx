import React, { createContext, useContext, useState } from "react";

export const AlertContext = createContext({test: "hello"});

const AlertContextProvider = (props) => {

  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("info");
  const [time, setTime] = useState(3000);

  const showAlert = (text, type, time) => {
    let timeMS = 3000; // 3 second wait by default
    if (time) timeMS = time;

    setText(text);
    setType(type);
    setTime(timeMS);
    setVisible(false);
    setTimeout(setVisible(true), 0);
  }

  const hideAlert = () => setVisible(false);

  return (
    <AlertContext.Provider value={{visible, text, type, time, showAlert, hideAlert}}>
      {props.children}
    </AlertContext.Provider>
  );
};

export default AlertContextProvider;
export const useAlertContext = () => useContext(AlertContext);