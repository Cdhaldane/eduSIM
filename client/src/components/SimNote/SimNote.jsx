import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SimNote.css";
import { Image } from "cloudinary-react";
import Modal from "react-modal";
import InviteCollaboratorsModal from "../InviteCollaboratorsModal";
import { useTranslation } from "react-i18next";
import axios from 'axios';

const SimNote = (props) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [json, setJson] = useState("");
  const [currDate, setDate] = useState("");
  const [simName, setSimName] = useState("");


  useEffect(() => {
    const getJson = async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getGameInstance/:adminid/:gameid', {
        params: {
          adminid: props.adminid,
          gameid: props.gameid
        }
      }).then((res) => {
        setJson(JSON.stringify(res));
        let str = res.data.updatedAt.slice(0, -14);
        setDate(str)
        setSimName(res.data.gameinstance_name)
      }).catch(error => {
        console.error(error);
      })
    }
    getJson();
  }, [props]);



  const downloadFile = async () => {
    const getRoles = async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
        params: {
          gameinstanceid: props.gameid,
        }
      }).then((res) => {
        let jsonCopy = JSON.parse(json);
        let jsonGame = JSON.parse(jsonCopy.data.game_parameters)
        jsonGame.roles = (res.data)
        jsonCopy.data.game_parameters = JSON.stringify(jsonGame)
        console.log(jsonCopy)

        const fileName = simName;
        const blob = new Blob([JSON.stringify(jsonCopy)], { type: 'application/json' });
        const href =  URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }).catch(error => {
        console.error(error);
      })
    }
    getRoles()
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
            <i
              className="lni lni-calendar notesim-icon"
              aria-hidden="true"

            ><h1>{currDate}</h1></i>
            <i
              className="lni lni-download notesim-icon"
              aria-hidden="true"
              onClick={() => downloadFile()}
            ><h1>{t("admin.download")}</h1></i>

            <Link
              to={{
                pathname: "/editpage",
                img: props.img,
                title: props.title,
                gameinstance: props.gameid,
                adminid: props.adminid,
              }}
            >
              <i id="pencil" className="lni lni-pencil" aria-hidden="true"><h1>{t("admin.simedit")}</h1></i>
            </Link>
            <i id="add-user" className="lni lni-users" onClick={() => setModalOpen(true)}><h1>{t("admin.siminvite")}</h1></i>
            <i
              id="garbage"
              className="lni lni-trash-can"
              aria-hidden="true"
              onClick={() => props.setConfirmationModal(true, props.gameid)}
            ><h1>{t("admin.simdelete")}</h1></i>

          </>
        ) : (
          <i className="lni lni-users" onClick={() => props.setConfirmationModal(true, props.gameid)} tooltip="test"><h1>Run</h1></i>
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
          ><h1>{t("admin.simrun")}</h1></i>
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
