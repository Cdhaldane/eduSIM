import React from "react";
import Table from "../Table/Table"

function CreateEmail(props) {

  return (
    <div className="areacsv">
      <form className="areacsvform">
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
