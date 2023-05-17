import React, { useState, Fragment, useEffect } from "react"
import "./Table.css"
import ReadOnlyRow from "./ReadOnlyRow";
import EditableRow from "./EditableRow"
import { useAuth0 } from "@auth0/auth0-react";
import { useAlertContext } from '../Alerts/AlertContext';
import { parse } from "papaparse";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./tailwind.css"

const Table = (props) => {
  const [highlighted, setHighlighted] = useState(false);
  const [rolelist, setRolelist] = useState()
  const [groupOr, setGroupOr] = useState("set")
  const [contacts, setContacts] = useState([{
    firstName: "",
    lastName: "",
    email: "",
    group: "",
    id: ""
  }]);
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
  const { t } = useTranslation();

  const [editContactId, setEditContactId] = useState(null);

  const { user } = useAuth0()
  const alertContext = useAlertContext();
  const [excludedEmails, setExcludedEmails] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (props.addstudent === false) {
      setGroupOr("admin.group")
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getAllPlayers/:gameinstanceid', {
        params: {
          id: props.gameid,
        }
      }).then((res) => {
        let data = []
        for (let i = 0; i < res.data.length; i++) {
          let cart = {
            firstName: "",
            lastName: "",
            email: "",
            group: "",
            id: ""
          }
          cart.firstName = (res.data[i].fname);
          cart.lastName = (res.data[i].lname);
          cart.email = (res.data[i].player_email);
          cart.group = (res.data[i].game_room);
          cart.id = (res.data[i].gameplayerid);
          data.push(cart);
        }
        setContacts(data)
      }).catch(error => {
        console.error(error);
      });
    } else {
      setGroupOr("common.role")
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/getPlayers/:game_room', {
        params: {
          game_room: props.gameroom,
          gameinstanceid: props.gameid
        }
      }).then((res) => {
        let data = []
        for (let i = 0; i < res.data.length; i++) {
          let cart = {
            firstName: "",
            lastName: "",
            email: "",
            group: "",
            id: ""
          }
          cart.firstName = (res.data[i].fname);
          cart.lastName = (res.data[i].lname);
          cart.email = (res.data[i].player_email);
          cart.group = (res.data[i].game_room);
          cart.gamerole = (res.data[i].gamerole);
          cart.id = (res.data[i].gameplayerid);
          data.push(cart);
        }
        setContacts(data);
      }).catch(error => {
        console.error(error);
      });
    }
    axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
        gameinstanceid: props.gameid,
      }
    }).then((res) => {
      const allData = res.data;
      let items = [(<option key={-1} value="">{t("admin.selectARole")}</option>)];
      for (let i = 0; i <= allData.length - 1; i++) {
        // Here I will be creating my options dynamically based on
        items.push(<option key={i} value={allData[i].gamerole}>{allData[i].gamerole}</option>);
        // What props are currently passed to the parent component
      }
      setRolelist(items);
    }).catch(error => {
      console.error(error);
    });
  }, [props.gameid]);

  // Add change
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

  // Add submit
  const handleAddFormSubmit = (event) => {
    event.preventDefault();
    let data = {
      gameinstanceid: props.gameid,
      fname: addFormData.firstName,
      lname: addFormData.lastName,
      game_room: props.gameroom[0],
      player_email: addFormData.email,
      gamerole: addFormData.group
    }
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/createPlayer', data).then((res) => {
      const newContact = {
        id: res.data.gameplayerid,
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email,
        group: addFormData.group,
      };
      const newContacts = [...contacts, newContact];
      setContacts(newContacts);
    }).catch(error => {
      console.error(error);
    });
    return false;
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const editedContact = {
      id: editContactId,
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      email: editFormData.email,
      gamerole: editFormData.gamerole,
      group: editFormData.group
    };

    const newContacts = [...contacts];

    const index = contacts.findIndex((contact) => contact.id === editContactId);

    newContacts[index] = editedContact;
    setContacts(newContacts);
    setEditContactId(null);

    let data = {
      gameplayerid: newContacts[index].id,
      fname: newContacts[index].firstName,
      lname: newContacts[index].lastName,
      player_email: newContacts[index].email,
      gamerole: newContacts[index].gamerole,
      game_room: newContacts[index].group
    }
    axios.put(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/updatePlayer', data).catch(error => {
      console.error(error);
    });
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
    axios.delete(process.env.REACT_APP_API_ORIGIN + '/api/playerrecords/deletePlayers/:gameplayerid', {
      params: {
        id: contactId
      }
    }).catch(error => {
      console.error(error);
    });
  };

  const handleEmail = (e) => {
    e.preventDefault();
    setSending(true);
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/email/sendInviteEmails', {
      exclude: excludedEmails,
      simname: props.title,
      admin: user.name,
      simid: props.gameid
    }).then((res) => {
      alertContext.showAlert(t("alert.emailSuccessful"), "info");
      props.onEmailSent();
      setSending(false);
    }).catch((error) => {
      console.error(error);
      if (error) {
        alertContext.showAlert(t("alert.emailError"), "error");
      }
      setSending(false);
    });
  }

  const handleCheckEmail = (id) => {
    if (!excludedEmails.includes(id)) {
      setExcludedEmails(old => [...old, id]);
    } else {
      setExcludedEmails(old => old.filter(val => val != id));
    }
  }

  const handleCheckAll = () => {
    if (excludedEmails.length !== 0) {
      setExcludedEmails([]);
    } else {
      setExcludedEmails(contacts.map(({ id }) => id));
    }
  }

  return (
    <div className={"app-container ${props?.className}"}>
      <div>
        <div
          className={`p-6 my-2 mx-auto max-w-md border-2 ${highlighted ? "border-green-600 bg-green-100" : "border-gray-600"
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
        <table className="table-el">
          <thead>
            <tr>
              {props.email && (
                <th className="table-checkrow">
                  <input type="checkbox" onClick={handleCheckAll} checked={excludedEmails.length === 0} />
                </th>
              )}
              <th>{t("admin.firstName")}</th>
              <th>{t("admin.lastName")}</th>
              <th>{t("admin.emailAddress")}</th>
              <th>{t(groupOr)}</th>
              <th>{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => (
              <Fragment key={index}>
                {editContactId === contact.id ? (

                  <EditableRow
                    contact={contact}
                    editFormData={editFormData}
                    handleEditFormChange={handleEditFormChange}
                    handleCancelClick={handleCancelClick}
                    rolelist={rolelist}
                    groupList={props.groups || []}
                    useGroup={groupOr === "admin.group"}
                    onCheck={props.email && (() => handleCheckEmail(contact.id))}
                    checked={!excludedEmails.includes(contact.id)}
                    online={props.players && props.players.some((id) => id === contact.id)}
                  />

                ) : (
                  <ReadOnlyRow
                    contact={contact}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={() => handleDeleteClick(contact.id)}
                    onCheck={props.email && (() => handleCheckEmail(contact.id))}
                    groupList={props.groups || []}
                    useGroup={groupOr === "admin.group"}
                    checked={!excludedEmails.includes(contact.id)}
                    online={props.players && props.players.some((id) => id === contact.id)}
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
          <form onSubmit={handleAddFormSubmit} className="addstudent-form">
            <input
              placeholder={t("admin.firstName")}
              id="firstname"
              type="text"
              name="firstName"
              required="required"
              onChange={handleAddFormChange}
              className="input-box"
            />
            <input
              placeholder={t("admin.lastName")}
              id="lastname"
              type="text"
              name="lastName"
              required="required"
              onChange={handleAddFormChange}
              className="input-box"
            />
            <input
              placeholder={t("admin.emailAddress")}
              id="email"
              type="text"
              name="email"
              required="required"
              onChange={handleAddFormChange}
              className="input-box email"
            />
            <select name="group" type="none" required="required" id="roledropdown" onChange={handleAddFormChange}>
              {rolelist}
            </select>
            <button type="submit" className="modal-button green add-student-b">{t("common.add")}</button>
          </form>
        </div>)
        : <>
          {props.email && (
            <div className="button-container">
              <button
                className="modal-button green "
                onClick={handleEmail}
                disabled={sending || excludedEmails.length === contacts.length}
              >
                {t("modal.email")}
              </button>
              <button className="modal-button red" onClick={props.close}>
                {t("common.cancel")}
              </button>
            </div>
          )}
        </>
      }
    </div>
  );
};

export default Table;
