import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import { Image } from "cloudinary-react";
import Modal from "react-modal";
import InviteCollaboratorsModal from "../InviteCollaboratorsModal";

const SimNote = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="notesim">
      <div className="notesim-thumbnail">
        <Image
          cloudName="uottawaedusim"
          publicId={
            "https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img
          }
          alt="backdrop"
        />
        <div className="notesim-name">
          <h1>{props.title}</h1>
        </div>
      </div>
      <div className="notesim-icons">
        {props.superadmin ? (
          <>
            <i
              id="garbage"
              className="fa fa-trash fa-2x notesim-icon"
              aria-hidden="true"
              onClick={() => props.setConfirmationModal(true, props.id)}
            ></i>
            <Link
              to={{
                pathname: "/editpage",
                img: props.img,
                title: props.title,
                gameinstance: props.gameid,
                adminid: props.adminid,
              }}
            >
              <i id="pencil" className="fa fa-pencil fa-2x notesim-icon" aria-hidden="true"></i>
            </Link>
            <i class="fas fa-user-plus fa-2x notesim-icon" onClick={() => setModalOpen(true)}></i>
          </>
        ) : (
          <i class="fas fa-user-slash fa-2x notesim-icon" onClick={() => props.setConfirmationModal(true, props.id)} tooltip="test"></i>
        )}
        <Link
          to={{
            pathname: "/join",
            img: props.img,
            title: props.title,
            gameinstance: props.gameid,
            adminid: props.adminid,
          }}
        >
          <i
            id="play"
            className="fas fa-play-circle fa-2x notesim-icon"
            onClick={() => localStorage.setItem("gameid", props.gameid)}
          ></i>
        </Link>
      </div>
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="createmodalarea"
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
        ariaHideApp={false}
      >
        <InviteCollaboratorsModal 
          close={() => setModalOpen(false)}
          gameid={props.gameid}
          title={props.title}
        />
      </Modal>
    </div>
  );
}

export default SimNote;
