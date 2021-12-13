import React from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useTranslation, Trans } from "react-i18next";

function Welcome(props) {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="welcome-container">
      <h1 className="welcome welcome-noanim">{t("home.welcome")}</h1>
      <p>{t("home.alreadyHaveRoomCode")}</p>
      <p>
        <form action={window.location.origin + document.getElementById.value}>
          <label className="welcome-join">
            {t("home.join")}
            <input type="text" className="textbox" placeholder={t("home.roomCode")} id="code" />
          </label>
        </form>
      </p>
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