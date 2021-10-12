import React from 'react';
import Modal from "react-modal";
import "../Modal/Modal.css";

const ConfirmationModal = (props) => {

  return (
    <Modal
      isOpen={props.visible}
      onRequestClose={props.hide}
      className="confirmationModal"
      overlayClassName="myoverlay"
      ariaHideApp={false}
      closeTimeoutMS={250}
    >
      <div>
        {props.message}
      </div>
      <div className={"confirmationModalButtons"}>
        <button id={"confirmModalConfirmButton"} onClick={() => {
          props.confirmFunction();
          props.hide();
        }}>
          {props.confirmMessage}
        </button>
        <button id={"confirmModalCancelButton"} onClick={props.hide}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;
