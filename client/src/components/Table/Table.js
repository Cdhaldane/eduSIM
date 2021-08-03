import React, {useState, Fragment} from "react"
import "./Table.css"
import data from "./mock-data.json"
import ReadOnlyRow from "../ReadOnlyRow";
import EditableRow from "../EditableRow"
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import { parse } from "papaparse";
import { nanoid } from "nanoid";
import axios from "axios";
import "./tailwind.css"


const Table = (props) => {
    const [highlighted, setHighlighted] = useState(false);
    const [contacts, setContacts] = useState(data);
    const [sent, setSent] = useState(false)
    const { user } = useAuth0();
    const [addFormData, setAddFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      group: "",
    });

    const [editFormData, setEditFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        group: "",
    });

    const [editContactId, setEditContactId] = useState(null);

    //Add change
    const handleAddFormChange = (event) => {
      event.preventDefault();

      const fieldName = event.target.getAttribute("name");
      const fieldValue = event.target.value;

      const newFormData = { ...addFormData };
      newFormData[fieldName] = fieldValue;

      setAddFormData(newFormData);
    };

    const handleEditFormChange = (event) => {
      event.preventDefault();

      const fieldName = event.target.getAttribute("name");
      const fieldValue = event.target.value;

      const newFormData = { ...editFormData };
      newFormData[fieldName] = fieldValue;

      setEditFormData(newFormData);
    };

    //Add submit
    const handleAddFormSubmit = (event) => {
      event.preventDefault();

      const newContact = {
        id: nanoid,
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email,
        group: addFormData.group,
      };

      const newContacts = [...contacts, newContact];
      setContacts(newContacts);
    };

    const handleEditFormSubmit = (event) => {
      event.preventDefault();

      const editedContact = {
        id: editContactId,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        group: editFormData.group,
      };

      const newContacts = [...contacts];

      const index = contacts.findIndex((contact) => contact.id === editContactId);

      newContacts[index] = editedContact;

      setContacts(newContacts);
      setEditContactId(null);
    };

    const handleEditClick = (event, contact) => {
      event.preventDefault();
      setEditContactId(contact.id);

      const formValues = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        group: contact.group,
      };

      setEditFormData(formValues);
    };

    const handleCancelClick = () => {
      setEditContactId(null);
    };

    const handleDeleteClick = (contactId) => {
      const newContacts = [...contacts];

      const index = contacts.findIndex((contact) => contact.id === contactId);

      newContacts.splice(index, 1);

      setContacts(newContacts);
    };

    const handleAddStudent = () => {
      return (
        <div className="addstudent">
        {/*<h2>Add a student</h2>*/}
        <form onSubmit={handleAddFormSubmit}>
          <input
            id="firstname"
            type="text"
            name="firstName"
            required="required"
            onChange={handleAddFormChange}
          />
          <input
            id="lastname"
            type="text"
            name="lastName"
            required="required"
            onChange={handleAddFormChange}
          />
          <input
            id="email"
            type="text"
            name="email"
            required="required"
            onChange={handleAddFormChange}
          />
          <input
            id="groupnumber"
            type="text"
            name="group"
            required="required"
            onChange={handleAddFormChange}
          />
        <button type="submit" id="addstudent">Add</button>
        </form>
        </div>
      )
    }
    const handleEmail = (e) => {
      e.preventDefault();
      {contacts.map((contact) => {
        console.log(contact.firstName)
        axios.post('http://localhost:5000/api/email/sendEmail', {
          pname: user.name,
          name: contact.firstName,
          lastname: contact.lastName,
          email: contact.email
        })
        .then((res) => {
           console.log(res)
           setSent(true)
          })
        .catch((error)=> {
          console.log('email failed');
          console.log(error.response)
        })
      })}
    }

    return (
      <div className="app-container">
      <div>
      <div
        className={`p-6 my-2 mx-auto max-w-md border-2 ${
          highlighted ? "border-green-600 bg-green-100" : "border-gray-600"
        }`}
        onDragEnter={() => {
          setHighlighted(true);
        }}
        onDragLeave={() => {
          setHighlighted(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          setHighlighted(false);

          Array.from(e.dataTransfer.files)
            .filter((file) => file.type === "text/csv")
            .forEach(async (file) => {
              const text = await file.text();
              const result = parse(text, { header: true });
              setContacts((contact) => [...contact, ...result.data]);
            });
        }}
      >
      </div>
      </div>
        <form onSubmit={handleEditFormSubmit}>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <Fragment>
                  {editContactId === contact.id ? (
                    <EditableRow
                      editFormData={editFormData}
                      handleEditFormChange={handleEditFormChange}
                      handleCancelClick={handleCancelClick}
                    />
                  ) : (
                    <ReadOnlyRow
                      contact={contact}
                      handleEditClick={handleEditClick}
                      handleDeleteClick={handleDeleteClick}
                    />
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </form>

        {(props.addstudent)
       ? (<div className="addstudent">
       {/*<h2>Add a student</h2>*/}
       <form onSubmit={handleAddFormSubmit}>
         <input
           id="firstname"
           type="text"
           name="firstName"
           required="required"
           onChange={handleAddFormChange}
         />
         <input
           id="lastname"
           type="text"
           name="lastName"
           required="required"
           onChange={handleAddFormChange}
         />
         <input
           id="email"
           type="text"
           name="email"
           required="required"
           onChange={handleAddFormChange}
         />
         <input
           id="groupnumber"
           type="text"
           name="group"
           required="required"
           onChange={handleAddFormChange}
         />
       <button type="submit" id="addstudent">Add</button>
       </form>
       </div>)
       : (<div> <button id="emailbutton" onClick={handleEmail}>Email</button> </div>)
      }
      </div>
    );
  };



export default Table;
