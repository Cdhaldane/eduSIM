import React, { useState, useEffect } from "react";
import { CSSTransition } from 'react-transition-group';

import "./AlertPopup.css";

const AlertPopup = (props) => {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const startTimer = () => {
    // Display for 3 seconds by default or use the prop.displayTIme if provided
    const displayTimeMS = props.displayTime ? props.displayTime : 3000;

    setTimeout(() => {
      setVisible(false);
    }, displayTimeMS);
  }

  return (
    <CSSTransition
      in={visible}
      timeout={300}
      classNames="alert-popup-css-anim"
      unmountOnExit
      onEnter={startTimer}
      onExited={props.hide}>
      <div className={"alert-popup " +
        (props.type === "warning" ? "warning " : "") +
        (props.type === "info" ? "info " : "") +
        (props.type === "error" ? "error " : "")}>

        {props.type === "warning" && (
          <i className="fas fa-exclamation-triangle alert-popup-icon warning" />
        )}
        {props.type === "info" && (
          <i className="fas fa-info-circle alert-popup-icon info" />
        )}
        {props.type === "error" && (
          <i className="fas fa-exclamation-triangle alert-popup-icon error" />
        )}

        {props.children}
      </div>
    </CSSTransition>
  );
}

export default AlertPopup;