import React from "react";
import DropdownRoles from "../Dropdown/DropdownRoles";

const CreateRole = (props) => {
  return (
    <div className="areacsv" >
      <form className="areacsvform modal-role-select">
        <p id="boxj1">Select the role you wish to play!</p>
        <div id="rolesdrops">
          <DropdownRoles
            gameid={props.gameid}
            roleLevel={props.handleRoleLevel}
            gameroles={props.gameroles}
            editMode={false}
          />
        </div>
      </form>
    </div>
  );
}

export default CreateRole;
