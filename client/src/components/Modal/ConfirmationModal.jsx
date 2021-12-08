import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import "../Modal/Modal.css";

const TIMEOUT_MS = 250;

const ConfirmationModal = (props) => {

  const { t } = useTranslation();
  const [msg, setMsg] = useState(null);

  const hide = () => {
    setMsg(props.message);
    props.hide();
  }

  useEffect(() => {
    setTimeout(() => setMsg(null), TIMEOUT_MS);
  }, [props.visible]);

  return (
    <Modal
      isOpen={props.visible}
      onRequestClose={hide}
      className="confirmationModal"
      overlayClassName="myoverlay"
      ariaHideApp={false}
      closeTimeoutMS={TIMEOUT_MS}
    >
      <div>
        {msg ? msg : props.message}
      </div>
      <div className={"confirmationModalButtons"}>
        <button id={"confirmModalConfirmButton"} onClick={() => {
          document.getElementById("confirmModalConfirmButton").disabled = true;
          props.confirmFunction();
          hide();
        }}>
          {props.confirmMessage}
        </button>
        <button id={"confirmModalCancelButton"} onClick={hide}>
          {t("modal.cancel")}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
