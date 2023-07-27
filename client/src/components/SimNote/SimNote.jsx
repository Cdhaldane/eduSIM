import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import { Image } from "cloudinary-react";
import Modal from "react-modal";
import InviteCollaboratorsModal from "../InviteCollaboratorsModal";
import { useTranslation } from "react-i18next";
import axios from 'axios';

import Calendar from "../../../public/icons/calendar.svg"
import Download from "../../../public/icons/download.svg"
import Pencil from "../../../public/icons/pencil.svg"
import Mail from "../../../public/icons/int-commercial-mail.svg"
import Trash from "../../../public/icons/trash-can-alt-2.svg"
import Play from "../../../public/icons/play.svg"

const SimNote = (props) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [json, setJson] = useState({});
  const [currDate, setDate] = useState(props.date.substring(0, 10));
  console.log(props)

  useEffect(() => {
    const getJson = async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
        params: {
          adminid: props.adminid,
          gameid: props.gameid
        }
      }).then((res) => {
        setJson(JSON.stringify(res.data));        
      }).catch(error => {
        console.error(error);
      })
    }
    getJson();
  }, [props.data]); // Will only run once after initial render

  const downloadFile = async () => {
    let jsonCopy = JSON.parse(json);
    const blob = new Blob([JSON.stringify(jsonCopy)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = props.title + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  return (
    <div className="notesim" >
      <div className="notesim-draggable"><div className="drag-icons"></div></div>
      <div className="notesim-thumbnail">
        <Image
          cloudName="uottawaedusim"
          publicId={
            "https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img
          }
          alt={t("alt.sim")}
        />
        <h1>{props.title}</h1>
      </div>
      <div className="notesim-icons">
        {props.superadmin ? (
          <>
            <i><Calendar className="icon sim-icon" /><h1>{currDate}</h1></i>
            <i className="notesim-icon" onClick={() => downloadFile()} ><Download className="icon sim-icon" /><h1>{t("admin.download")}</h1></i>
            <Link
              to={{
                pathname: "/editpage",
                img: props.img,
                title: props.title,
                gameinstance: props.gameid,
                adminid: props.adminid,
              }}
            >
              <Pencil className="icon sim-icon" /><h1>{t("admin.simedit")}</h1>
            </Link>
            <i id="add-user" onClick={() => setModalOpen(true)}><Mail className="icon sim-icon" /><h1>{t("admin.siminvite")}</h1></i>
            <i
              id="garbage"
              aria-hidden="true"
              onClick={() => props.setConfirmationModal(true, props.gameid)}
            ><Trash className="icon sim-icon" /><h1>{t("admin.simdelete")}</h1></i>

          </>
        ) : (
          <i onClick={() => props.setConfirmationModal(true, props.gameid)} tooltip="test"><Trash className="icon sim-icon" /><h1>Run</h1></i>
        )}
        <Link
          to={{
            pathname: "/join",
            img: props.img,
            title: props.title,
            gameinstance: props.gameid,
            adminid: props.adminid,
          }}
          onClick={() => localStorage.setItem("gameid", props.gameid)}
        >
          <Play className="icon sim-icon" /><h1>{t("admin.simrun")}</h1>
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
