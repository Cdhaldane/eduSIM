import React from "react";
import DropdownRoles from "../Dropdown/DropdownRoles";

function CreateRole(props) {
  return (
    <div class="areacsv" >
      <form className="areacsvform modal-role-select">
        <p id="boxj1"> Select the role you wish to play! </p>
        <p id="rolesdrops">
          <DropdownRoles
            gameid={props.gameid}
          />
        </p>
      </form>
    </div>
  );
}

export default CreateRole;
