import React, { useState } from "react";
import Dropdownroles from "../DropDown/Dropdownroles";



  function CreateRole(props) {
    console.log(props)
  return (
      <div class="areacsv" >
      <form className="areacsvform">
        <p id="boxj1"> Select the role you wish to play! </p>
      <p id="rolesdrops">
          <Dropdownroles
            gameid={props.gameid}
          />
        </p>
        </form>

    </div>
  );
}

export default CreateRole;
