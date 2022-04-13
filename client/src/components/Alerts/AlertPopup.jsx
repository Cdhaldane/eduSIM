import React from "react";
import { CSSTransition } from 'react-transition-group';
import { useAlertContext } from './AlertContext';
import Loading from "../Loading/Loading";

import "./AlertPopup.css";

import Circle from "../../../public/icons/question-circle.svg"
import Triangle from "../../../public/icons/warning.svg"

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
        (alertContext.type === "error" ? "error " : "") +
        (alertContext.type === "loading" ? "info " : "")}>

        {alertContext.type === "warning" && (
          <i className="alert-popup-icon warning" ><Circle className="icon alert-icon"/></i>
        )}
        {alertContext.type === "info" && (
          <i className="alert-popup-icon info" ><Triangle className="icon alert-icon"/></i>
        )}
        {alertContext.type === "error" && (
          <i className="alert-popup-icon error" ><Circle className="icon alert-icon"/></i>
        )}
        {alertContext.type === "loading" && (
          <div className="loadingMediaAlert">
            <Loading />
          </div>
        )}
        {alertContext.text}
      </div>
    </CSSTransition>
  );
}

export default AlertPopup;
