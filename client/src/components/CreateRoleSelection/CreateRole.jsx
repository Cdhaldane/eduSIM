import React, { useState } from "react";
import DropdownRoles from "../Dropdown/DropdownRoles";
import styled from "styled-components";

const NameInput = styled.input`
  grid-area: main;
  background-color: #e5e5e5;
  font-family: 'Montserrat', sans-serif;
  background: none;
  border: 1px rgba(0,0,0,0.6) solid;
  font-size: 1.3em;
  border-radius: 10px;
  padding: 10px;  
  margin-right: 10px;
  flex: 1;
  min-width: 0;
  max-width: 300px;
`;

const Submit = styled.button`
  font-family: inherit;
  padding: 5px 10px;
  color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
  cursor: pointer;
  background-color: var(--primary);
  border: none;
  font-size: 1.5rem;
`;

const CreateRole = (props) => {
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    props.handleSubmit({role, name});
    return false;
  }

  return (
    <div className="areacsv" >
      <form className="areacsvform modal-role-select">
        <p id="boxj1">Select the role and name you wish to play as!</p>
        <div id="rolesdrops">
          <DropdownRoles
            gameid={props.gameid}
            roleLevel={setRole}
            gameroles={props.gameroles}
            editMode={false}
          />
        </div>
        <form onSubmit={handleSubmit} action="#">
          <NameInput type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Submit type="submit">Go</Submit>
        </form>
      </form>
    </div>
  );
}

export default CreateRole;
