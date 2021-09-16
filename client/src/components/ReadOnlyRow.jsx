import React from "react";

const ReadOnlyRow = ({ contact, handleEditClick, handleDeleteClick }) => {
  return (
    <tr>
      <td>{contact.firstName}</td>
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
