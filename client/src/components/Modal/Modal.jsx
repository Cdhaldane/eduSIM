import React, { useState } from 'react'
import ReactDom from 'react-dom'
import Button from "../Buttons/Button"
import { nanoid } from "nanoid";
import data from "../Table/mock-data.json";
import "../Modal/Modal.css"

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#FFF',
  padding: '50px',
  zIndex: 1000,
  width: 700,
  height: 500
}

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, .7)',
  zIndex: 1000
}

export default function Modal({ open, children, onClose }) {
  const [contacts, setContacts] = useState(data);
  const [addFormData, setAddFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    group: "",
  });

  const handleAddFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...addFormData };
    newFormData[fieldName] = fieldValue;

    setAddFormData(newFormData);
  }

  const handleAddFormSubmit = (event) => {
    event.preventDefault();

    const newContact = {
      id: nanoid(),
      fullName: addFormData.firstName,
      address: addFormData.lastName,
      phoneNumber: addFormData.email,
      email: addFormData.group,
    };

    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
  }

  if (!open) {
    return null;
  }

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div style={MODAL_STYLES}>
        <h2>Add Student/Participant</h2>
        <form onSubmit={handleAddFormSubmit}>
          <div>
            <h2>First Name:</h2>
            <input
              className="block"
              type="text"
              name="firstName"
              required="required"
              onChange={handleAddFormChange}
            />
          </div>
          <div>
            <h2>Last Name:</h2>
            <input
              className="block"
              type="text"
              name="lastName"
              required="required"
              onChange={handleAddFormChange}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              className="block"
              type="text"
              name="email"
              required="required"
              onChange={handleAddFormChange}
            />
          </div>
          <div>
            <label>Group:</label>
            <input
              className="block"
              type="text"
              name="group"
              required="required"
              onChange={handleAddFormChange}
            />
          </div>
          <Button onClick={onClose} type="submit">Save</Button>
        </form>
        {children}
      </div>
    </>,
    document.getElementById('portal')
  )
}
