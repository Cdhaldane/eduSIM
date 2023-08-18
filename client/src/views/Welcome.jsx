import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation, Trans } from "react-i18next";
import axios from "axios";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useHistory } from "react-router-dom";
import { supabase } from "../components/Supabase";

import "./Styles/Welcome.css";

const Welcome = (props) => {
  const { t } = useTranslation();
  const alertContext = useAlertContext();
  let history = useHistory();
  const [code, setCode] = useState("");



  const joinGame = async (e) => {
    e.preventDefault();

    const { data: roomData } = await axios.get(
      process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getRoomByURL', {
      params: {
        url: code,
      }
    });
    console.log(roomData)
    if (!!roomData.gameroomid) {
      history.push(`/gamepage/${code}`);
    } else {
      alertContext.showAlert(t("alert.roomDoesntExist"), "error");
    }

    return false;
  };

  const handleRedirect = () => {
    window.location.href = window.location.origin + "/dashboard";
  }

  return (
    <div className="welcome-container-welcome">
        <div className='welcome-text'>
        <h1>{t("home.alreadyHaveRoomCode")}</h1>
          <Trans i18nKey="home.getCodeOrCreateSim">
              If not, get one from your teacher/facilitator, or
              <button
                id="link"
                onClick={handleRedirect}>
                create your own simulation.
              </button>
            </Trans>
            <form onSubmit={joinGame} className="welcome-join">
              <input type="text" className="textbox" placeholder={t("home.roomCode")} value={code} onChange={(e) => setCode(e.target.value)} />
              <input type="submit" className="welcome-submit" value={t("home.join")} />
            </form>
        </div>
         <div className='welcome-img'>
            <img src="/assets/03_Illustrations LogoIn.png" alt={t("alt.team")}></img>
        </div>
      </div>

  );
}

export default Welcome;

