import React, { useEffect, useState } from "react";
import DropdownRoles from "../Dropdown/DropdownRoles";
import styled from "styled-components";
import { useAlertContext } from '../Alerts/AlertContext';
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    if (role && (role.num && role.num !== -1 && rolesTaken[role.name] >= role.num)) {
      alertContext.showAlert(t("alert.roleLimitExceeded"), "warning");
      return false;
    }
    if (!role.name) {
      alertContext.showAlert(t("alert.noRoleSelected"), "warning");
      return false;
    }
    props.handleSubmit({role: role?.name, name});
    return false;
  }

  const handleSetRole = (name, num) => {
    setRole({name, num});
  }

  const userExists = Object.keys(props.initialUserInfo).length>0;

  return (
    <div className="areacsv" >
      <div className="areacsvform modal-role-select">
        <div className="modal-role-header">
          <h2>{t("game.welcomeToTheSimulation")}</h2>
          <p>{userExists ? t("game.joiningAsX", { name: `${props.initialUserInfo.fname} ${props.initialUserInfo.lname}` }) : t("game.inputName")}</p>
        </div>
        <div id="rolesdrops">
          <span>{t("common.role")}</span>
          <DropdownRoles
            gameid={props.gameid}
            roleLevel={handleSetRole}
            editMode={false}
            rolesTaken={rolesTaken}
            initRole={role}
            disabled={props.roleSelection !== "student"}
            random={props.roleSelection.startsWith("random")}
          />
        </div>
        <form onSubmit={handleSubmit} action="#">
          <span>{t("game.name")}</span>
          <NameInput 
            type="text" 
            placeholder={t("game.namePlaceholder")}
            value={name ? name : ""} 
            onChange={(e) => setName(e.target.value)} 
            required
            maxLength="25"
          />
          <Submit type="submit">{t("game.go")}</Submit>
        </form>
      </div>
    </div>
  );
}

export default CreateRole;
