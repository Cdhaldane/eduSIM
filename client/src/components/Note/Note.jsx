
import React from "react";
import { Link } from "react-router-dom";
import "./Note.css";
import { useTranslation } from "react-i18next";

const Note = (props) => {
  const { t } = useTranslation();
  return (
    props.onClick ? (
      <div className={props.className} alt="sim background"  >
        <img src={props.img} alt="note background"/>
        <div className="mobile-view">
        <h1>{props.title}</h1>
        <h2>{props.text}</h2>
      <button onClick={props.onClick} type="button" className="w-button">{t("home.cookieLearnMore")}</button>
    </div>
      </div>
    ) : (
      <div  className={props.className} >
        <img src={props.img} alt="note background"/>
      <div className="mobile-view">
        <h1>{props.title}</h1>
        <h2>{props.text}</h2>
        <Link to={props.url} className="w-button fix" type="button">{t("home.cookieLearnMore")}</Link>
    </div>
      </div>
    )
  );
}

export default Note;
