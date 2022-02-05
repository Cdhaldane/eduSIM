import React from "react";
import { useTranslation } from "react-i18next";

const About = (props) => {
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <div className="privacy-container">
      <h1 className="welcome">{t("home.about")}</h1>
      </div>
    </div>
  );
}

export default About;
