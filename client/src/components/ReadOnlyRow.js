import React from "react";

const ReadOnlyRow = ({ contact, handleEditClick, handleDeleteClick }) => {
  console.log(contact)
  return (
    <tr>
      <td>{contact.firstName}</td>
      <td>{contact.lastName}</td>
      <td>{contact.email}</td>
      <td>{contact.group}</td>
      <td>
        <button
          type="button"
          onClick={(event) => handleEditClick(event, contact)}
        >
          Edit
        </button>
        <button type="button" onClick={() => handleDeleteClick(contact.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ReadOnlyRow;
