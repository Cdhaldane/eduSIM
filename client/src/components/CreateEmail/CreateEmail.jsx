import React, { useRef, useEffect } from "react";
import Table from "../Table/Table"

function CreateEmail(props) {
  const detailsArea = new useRef();

  const handleClickOutside = e => {
    if (detailsArea.current &&
      !(detailsArea.current.contains(e.target))) {
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
        <p className="modal-title"> Email Room Codes to Students / Participants </p>
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
