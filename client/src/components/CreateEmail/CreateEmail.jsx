import React, { useRef, useEffect } from "react";
import Table from "../Table/Table";
import { useTranslation } from "react-i18next";

function CreateEmail(props) {
  const detailsArea = new useRef();
  const { t } = useTranslation();

  const handleClickOutside = e => {
    if (detailsArea.current &&
      !detailsArea.current.contains(e.target) &&
      e.target.tagName != "BUTTON") {
      props.close();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="areacsv">
      <form ref={detailsArea} className="areacsvform">
        <p className="modal-title">{t("modal.emailRoomCodeToStudents")}</p>
        <Table
          email={true}
          addstudent={false}
          className="emailmodal-table"
          gameid={props.gameid}
          title={props.title}
          onEmailSent={props.close}
        />
      </form>
    </div>
  );
}

export default CreateEmail;
