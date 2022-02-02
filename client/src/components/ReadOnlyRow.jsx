import React from "react";
import { useTranslation } from "react-i18next";

const ReadOnlyRow = ({
  contact,
  handleEditClick,
  handleDeleteClick,
  online,
  onCheck,
  checked,
  useGroup,
  groupList
}) => {
  const { t } = useTranslation();
  return (
    <tr className={online ? "user-online" : ""}>
      {onCheck && (
        <td className="table-checkrow">
          <input type="checkbox" onClick={onCheck} checked={checked} />
        </td>
      )}
      <td>{contact.firstName} {online && <span>(ingame)</span>}</td>
      <td>{contact.lastName}</td>
      <td>{contact.email}</td>
      {useGroup
      ? <td>{groupList.some(([val]) => val === contact.group) ? contact.group : "N/A"}</td>
      : <td>{contact.gamerole}</td>}
      <td>
        <div>
          <button
            type="button"
            className="modal-button green"
            onClick={(event) => handleEditClick(event, contact)}
          >
            {t("common.edit")}
          </button>
          <button type="button" className="modal-button red" onClick={() => handleDeleteClick(contact.id)}>
            {t("common.delete")}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ReadOnlyRow;
