import React from "react";
import { useTranslation, Trans } from "react-i18next";

const About = (props) => {
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <div className="privacy-container">
        <h1 className="welcome">{t("home.about")}</h1>
        <p>{t('home.aboutP1')}</p>
        <p>{t('home.aboutP2')}</p>
        <p>
          <Trans i18nKey="home.aboutP3">
            The eduSIM platform is licensed under an  
            <a href="https://www.ecampusontario.ca/wp-content/uploads/2021/10/Ontario-Commons-License-No-Derivatives.pdf">Ontario Commons License - No Derivatives.</a>
            Example simulations provided with the eduSIM platform are licensed under a 
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License.</a>
          </Trans>
        </p>
        <p>
          <Trans i18nKey="home.aboutP4">
            eduSIM was designed and developed by the 
            <a href="https://dumonddesign.com/">Dumond Design Lab</a>
            at the University of Ottawa.
          </Trans>
        </p>
        <p><i>
          <Trans i18nKey="home.aboutP5">
            This project is made possible with funding by the Government of Ontario and through eCampusOntario’s support of the Virtual Learning Strategy. To learn more about the Virtual Learning Strategy visit:
            <a href="https://vls.ecampusontario.ca/">https://vls.ecampusontario.ca.</a>
          </Trans>
        </i></p>
        <br/>
        <div className="about-logos">
          <a href="https://dumonddesign.com/"><img src="ddl.png"></img></a>
          <a href="https://www2.uottawa.ca/"><img src="uottawa.png"></img></a>
          <a href="https://vls.ecampusontario.ca/"><img src="ecampus.png"></img></a>
        </div>
      </div>
    </div>
  );
}

export default About;
