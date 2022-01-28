import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Note from "../components/Note/Note";
import { useTranslation } from "react-i18next";

const Home = (props) => {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();

  return (
  <div className="welcome-container">
    <div class='row'>
      <div class='column left'>
        <div class='welcome-nav'>
          <h1>{t("home.title")}</h1>
          <h2>{t("home.sub-title")}</h2>
          <img src="lightbulb.png"></img>
        </div>
      </div>
      <div class='column right'>
         <div class='welcome-notes'>
          <Note
            title={t("home.isStudent")}
            text={t("home.student_welcome")}
            url="/welcome"
            img="01_Illustrations Student.png"
            className="welcome-navbutton"
          />
          <Note
            title={t("home.isTeacher")}
            text={t("home.welcomeText")}
            onClick={() => loginWithRedirect({ redirectUri: window.location.origin + "/dashboard", prompt: "select_account" })}
            img="02_Illustrations Teacher.png"
            className="welcome-navbutton fix"
          />
        </div>
      </div>
    </div>
  </div>
  );
}

export default Home;
