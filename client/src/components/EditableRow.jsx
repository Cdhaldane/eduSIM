import React from "react";

const EditableRow = ({
  editFormData,
  handleEditFormChange,
  handleCancelClick,
  handleUpdate,
  rolelist
}) => {
  
  return (
    <tr>
      <td>
        <input
          type="text"
          required="required"
          name="firstName"
          value={editFormData.firstName}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td>
        <input
          type="text"
          required="required"
          name="lastName"
          value={editFormData.lastName}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td>
        <input
          type="text"
          required="required"
          name="email"
          value={editFormData.email}
          onChange={handleEditFormChange}
          size="1"
        ></input>
      </td>
      <td>
        <select name="group" type="text" required="required" id="roledropdown" onChange={handleEditFormChange}>
          {rolelist}
        </select>
      </td>
      <td>
        <div>
          <button type="submit" >Save</button>
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EditableRow;
