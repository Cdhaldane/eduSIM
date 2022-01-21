import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import { Image } from "cloudinary-react";
import Modal from "react-modal";
import InviteCollaboratorsModal from "../InviteCollaboratorsModal";
import moment from "moment";
import { useTranslation } from "react-i18next";

const SimNote = (props) => {
  const [modalOpen, setModalOpen] = useState(false);

  var today = new Date(),
  date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  const [currDate] = useState(date);

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
          <h1>{props.title}</h1>
      </div>
      <div className="notesim-icons">
        {props.superadmin ? (
          <>
          <i
            className="lni lni-calendar notesim-icon"
            aria-hidden="true"

          ><h1>{currDate}</h1></i>

            <Link
              to={{
                pathname: "/editpage",
                img: props.img,
                title: props.title,
                gameinstance: props.gameid,
                adminid: props.adminid,
              }}
            >
              <i id="pencil" className="lni lni-pencil" aria-hidden="true"><h1>Edit</h1></i>
            </Link>
            <i id="add-user" className="lni lni-users" onClick={() => setModalOpen(true)}><h1>Invite Collaborators</h1></i>
              <i
                id="garbage"
                className="lni lni-trash-can"
                aria-hidden="true"
                onClick={() => props.setConfirmationModal(true, props.id)}
              ><h1>Delete</h1></i>
          </>
        ) : (
          <i className="lni lni-users" onClick={() => props.setConfirmationModal(true, props.id)} tooltip="test"><h1>Run</h1></i>
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
            className="lni lni-chevron-right-circle"
            onClick={() => localStorage.setItem("gameid", props.gameid)}
          ><h1>Run</h1></i>
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
