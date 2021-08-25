import React, { useState } from "react";
import Table from "../Table/Table"
import { Container, Row, Col } from "react-bootstrap";
import Dropdownroles from "../DropDown/Dropdownroles";



  function CreateRole(props) {
    console.log(props)
  return (
      <div class="areacsv" >
        <Container>
      <form id="areacsvform">
        <p id="boxj1"> Select the role you wish to play! </p>
      <p id="rolesdrops">
          <Dropdownroles
            gameid={props.gameid}
          />
        </p>
        </form>
        </Container>

    </div>
  );
}

export default CreateRole;
