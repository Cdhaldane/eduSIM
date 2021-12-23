import React, { useState } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation, Trans } from "react-i18next";
import axios from "axios";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useHistory } from "react-router-dom";

const Welcome = (props) => {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();
  const alertContext = useAlertContext();
  let history = useHistory();
  const [code, setCode] = useState("");

  const joinGame = async (e) => {
    e.preventDefault();
    
    const { data: roomData } = await axios.get(
      process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getRoomByURL', {
      params: {
        id: code,
      }
    });

    if (!!roomData) {
      history.push(`/gamepage/${code}`);
    } else {
      alertContext.showAlert(t("alert.roomDoesntExist"), "error");
    }

    return false;
  };

  return (
    <div className="welcome-container">
      <h1 className="welcome welcome-noanim">{t("home.welcome")}</h1>
      <p>{t("home.alreadyHaveRoomCode")}</p>
      <form onSubmit={joinGame} className="welcome-join">
        <input type="text" className="textbox" placeholder={t("home.roomCode")} value={code} onChange={(e) => setCode(e.target.value)} />
        <input type="submit" value={t("home.join")} />
      </form>
      <p>
        <Trans i18nKey="home.getCodeOrCreateSim">
          If not, get one from your teacher/facilitator, or 
          <button 
            id="link" 
            onClick={() => loginWithRedirect({ 
              redirectUri: window.location.origin + "/dashboard", 
              prompt: "select_account" 
            })}> 
            create your own simulation.
          </button>
        </Trans>
      </p>
    </div>
  );
}

export default Welcome;