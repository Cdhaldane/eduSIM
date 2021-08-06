import React, { useState } from "react";
import Table from "../Table/Table"
import { Container, Row, Col } from "react-bootstrap";



  function CreateEmail(props) {
  // sets all const


  return (
      <div class="areacsv" >
        <Container>
      <form id="areacsvform">
        <p id="boxj1"> Email Room Codes to Students/Participants </p>
          <div id="emailtable">
          <Table addtsudent={false}/>
          </div>
        </form>
        </Container>

    </div>
  );
}

export default CreateEmail;
