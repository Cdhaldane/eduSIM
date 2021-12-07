import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Note from "../components/Note/Note";
import { useTranslation } from "react-i18next";


function Home(props) {
  const { t } = useTranslation();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="welcome-container">
      <h1 className="welcome">{t("home.welcome")}</h1>
      <div className="welcome-nav">
        <Note
          title={t("home.isStudent")}
          url="/welcome"
          img="student.png"
          className="welcome-navbutton"
        />
        <Note
          title={t("home.isTeacher")}
          onClick={() => loginWithRedirect({ redirectUri: window.location.origin + "/dashboard", prompt: "select_account" })}
          img="teacher.png"
          className="welcome-navbutton"
        />
      </div>
    </div>
  );
}

export default Home;
