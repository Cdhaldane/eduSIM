import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Note from "../components/Note/Note";
import { useTranslation } from "react-i18next";

const Home = (props) => {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="welcome-container">

      <div className="welcome-nav">
        <h1 className="welcome">We boost growth for your startup business</h1>
        <Note
          title={t("home.isStudent")}
          text={t("home.welcomeText")}
          url="/welcome"
          img="01_Illustrations Student.png"
          className="welcome-navbutton"
        />
        <Note
          title={t("home.isTeacher")}
          text={t("home.welcomeText")}
          onClick={() => loginWithRedirect({ redirectUri: window.location.origin + "/dashboard", prompt: "select_account" })}
          img="02_Illustrations Teacher.png"
          className="welcome-navbutton"
        />
      </div>
      <h2 className="welcome-desc">Educational Simulated Interaction Models (eduSIMs) are designed and clinically tested simulations for future teachers and school leaders.</h2>
      <img className="lightbulb-img" src="lightbulb.png"></img>
    </div>
  );
}

export default Home;
