import React from "react";
import { useTranslation } from "react-i18next";
import Gravatar from "react-gravatar";

const EditableRow = ({
  editFormData,
  handleEditFormChange,
  handleCancelClick,
  handleUpdate,
  online,
  rolelist,
  onCheck,
  checked,
  useGroup,
  groupList,
  contact
}) => {
  const { t } = useTranslation();

  return (
    <tr className={online ? "user-online" : ""}>
      {onCheck && (
        <td className="table-checkrow">
          <input type="checkbox" onClick={onCheck} checked={checked} />
        </td>
      )}

      <td><Gravatar email={contact.email}  /></td>
      <td id="fix1">
        <input
          type="text"
          required="required"
          name="firstName"
          value={editFormData.firstName}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td id="fix2">
        <input
          type="text"
          required="required"
          name="lastName"
          value={editFormData.lastName}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td id="fix3">
        <input
          type="text"
          required="required"
          name="email"
          value={editFormData.email}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td id="fix4">
        {useGroup ? (
          <select name="group" type="text" required="required" id="roledropdownadd" onChange={handleEditFormChange}>
            <option key={-1} value="">{t("admin.selectAGroup")}</option>)];
            {groupList.map(val => (
              <option key={val[1]} value={val[0]}>{val[0]}</option>
            ))}
          </select>
        ) : (
          <select name="gamerole" type="text" required="required" id="roledropdownadd" onChange={handleEditFormChange}>
            {rolelist}
          </select>
        )}
      </td>
      <td>
        <div id="fix5">

          <button className="modal-button green" type="submit" >{t("common.save")}</button>
          <button className="modal-button red" type="button" onClick={handleCancelClick}>
          {t("common.cancel")}
          </button>
        </div>

      </td>

    </tr>

  );
};

export default EditableRow;
