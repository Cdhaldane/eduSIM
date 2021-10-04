import React, { useEffect, useEffects, useState } from "react";
import DropdownRoles from "../Dropdown/DropdownRoles";
import styled from "styled-components";
import { useAlertContext } from '../Alerts/AlertContext';

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
  const alertContext = useAlertContext();

  const rolesTaken = Object.values(props.players).reduce((roles, {role}) => {
    const roleCount = roles[role] || 0;
    return {
      ...roles,
      [role]: roleCount+1
    };
  }, {});

  useEffect(() => {
    setRole({name: props.initialUserInfo?.gamerole});
    setName(props.initialUserInfo?.fname);
  }, [props.initialUserInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role && (role.num && rolesTaken[role.name] >= role.num)) {
      alertContext.showAlert("Too many people have already chosen this role. Please choose a different one.", "warning");
      return false;
    }
    props.handleSubmit({role: role?.name, name});
    return false;
  }

  const handleSetRole = (name, num) => {
    setRole({name, num});
  }

  return (
    <div className="areacsv" >
      <form className="areacsvform modal-role-select">
        <p id="boxj1">Select the role and name you wish to play as!</p>
        <div id="rolesdrops">
          <DropdownRoles
            gameid={props.gameid}
            roleLevel={handleSetRole}
            editMode={false}
            rolesTaken={rolesTaken}
            initRole={role}
          />
        </div>
        <form onSubmit={handleSubmit} action="#">
          <NameInput 
            type="text" 
            placeholder="Your name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
            maxLength="25"
          />
          <Submit type="submit">Go</Submit>
        </form>
      </form>
    </div>
  );
}

export default CreateRole;
