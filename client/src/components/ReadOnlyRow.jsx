import React from "react";

const ReadOnlyRow = ({ contact, handleEditClick, handleDeleteClick, online }) => {
  return (
    <tr className={online ? "user-online" : ""}>
      <td>{contact.firstName} {online && <span>(ingame)</span>}</td>
      <td>{contact.lastName}</td>
      <td>{contact.email}</td>
      <td>{contact.group}</td>
      <td>
        <div>
          <button
            type="button"
            onClick={(event) => handleEditClick(event, contact)}
          >
            Edit
          </button>
          <button type="button" onClick={() => handleDeleteClick(contact.id)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ReadOnlyRow;
