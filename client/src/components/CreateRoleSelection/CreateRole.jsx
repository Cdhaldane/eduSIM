import React, { useState } from "react";
import { Container } from "react-bootstrap";
import DropdownRoles from "../DropDown/DropdownRoles";

function CreateRole(props) {
  return (
    <div className="areacsv" >
      <Container>
        <form id="areacsvform">
          <p id="boxj1">Select the role you wish to play!</p>
          <p id="rolesdrops">
            <DropdownRoles
              gameid={props.gameid}
            />
          </p>
        </form>
      </Container>
    </div>
  );
}

export default CreateRole;
