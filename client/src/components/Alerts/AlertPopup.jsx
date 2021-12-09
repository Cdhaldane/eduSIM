import React from "react";
import { CSSTransition } from 'react-transition-group';
import { useAlertContext } from './AlertContext';

import "./AlertPopup.css";

const AlertPopup = () => {

  const alertContext = useAlertContext();

  const startTimer = () => {
    setTimeout(() => {
      alertContext.hideAlert();
    }, alertContext.time);
  }

  return (
    <CSSTransition
      in={alertContext.visible}
      timeout={300}
      classNames="alert-popup-css-anim"
      unmountOnExit
      onEnter={startTimer}>
      <div className={"alert-popup " +
        (alertContext.type === "warning" ? "warning " : "") +
        (alertContext.type === "info" ? "info " : "") +
        (alertContext.type === "error" ? "error " : "")}>

        {alertContext.type === "warning" && (
          <i className="fas fa-exclamation-triangle alert-popup-icon warning" />
        )}
        {alertContext.type === "info" && (
          <i className="fas fa-info-circle alert-popup-icon info" />
        )}
        {alertContext.type === "error" && (
          <i className="fas fa-exclamation-triangle alert-popup-icon error" />
        )}

        {alertContext.text}
      </div>
    </CSSTransition>
  );
}

export default AlertPopup;