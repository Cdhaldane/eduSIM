import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useAlertContext } from '../Alerts/AlertContext';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import moment from "moment";
import ConfirmationModal from "../Modal/ConfirmationModal";

const EmailInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-right: 5px;
  flex: 1;
  & > div {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  & input {
    font-family: inherit;
    font-size: 1.2em;
    padding: 5px;
  }
  & .adduser {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 5px 10px;
    font-family: inherit;
    font-size: 1.2em;
    border-radius: 5px;
    cursor: pointer;
  }
  & .removeuser {
    color: var(--primary);
    margin-left: 5px;
    font-size: 1.5em;
    cursor: pointer;
    background: none;
    border: none;
  }
`;

const Collaborators = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 5px;
  overflow-y: auto;
  flex: 1;
  & > div {
    display: flex;
    text-align: left;
    min-height: 40px;
    align-items: center;
  }
  & i {
    color: var(--primary);
    font-size: 1.5em;
    margin-left: 10px;
    cursor: pointer;
  }
  & > h3 {
    padding-bottom: 5px;
  }
`;

function InviteCollaboratorsModal(props) {
  const detailsArea = new useRef();
  const [emails, setEmails] = useState([""]);
  const [sending, setSending] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const alertContext = useAlertContext();
  const { user } = useAuth0();
  const [revokeUser, setRevokeUser] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  
  useEffect(() => {
    (async () => {
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getCollaborators/' + props.gameid, {}).then((res) => {
        const allData = res.data;
        setCollaborators(allData);
      }).catch(error => {
        console.log(error);
      });
    })();
  }, [user]);
  
  const handleClickOutside = e => {
    if (detailsArea.current &&
      !confirmationVisible &&
      !(detailsArea.current.contains(e.target))) {
      props.close();
    }
  };

  const handleUpdateEmail = (val, ind) => {
    let newEmails = [...emails];
    newEmails[ind] = val;
    setEmails(newEmails);
  }

  const handleAddUser = () => {
    setEmails([...emails, ""]);
  }

  const handleRemoveUser = (ind) => {
    // if this wasnt wrapped in a timeout, the code to check if
    // a user clicked outside would fire after the email element disappears,
    // which means it no longer is contained in the form and triggers
    // the modal to close. >:(
    setTimeout(() => setEmails(emails.filter((_,i) => i!=ind)), 20);
  }

  const handleSendEmails = () => {
    setSending(true);
    axios.post(process.env.REACT_APP_API_ORIGIN + '/api/email/sendCollaboratorEmails', {
      emails,
      admin: user.name,
      simid: props.gameid,
      simname: props.title
    }).then((res) => {
      alertContext.showAlert("Invitations have been successfully sent to given email addresses.", "info");
      props.close();
      setSending(false);
    }).catch((error) => {
      console.log(error);
      if (error) {
        alertContext.showAlert("An error has occured while attempting to send email invitations. Please try again.", "error");
      }
      setSending(false);
    });
  }

  const handleOpenConfirm = (user) => {
    setRevokeUser(user);
    setConfirmationVisible(true);
  }

  const handleRevokeUser = async () => {
    await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/revokeGameInstanceAccess', {
      gameinstanceid: props.gameid,
      adminid: revokeUser.id
    }).catch(error => {
      console.error(error);
    });
    await axios.get(process.env.REACT_APP_API_ORIGIN + '/api/gameinstances/getCollaborators/' + props.gameid, {}).then((res) => {
      const allData = res.data;
      setCollaborators(allData);
    }).catch(error => {
      console.log(error);
    });
    setRevokeUser(null);
  }

  const hideConfirm = () => {
    setRevokeUser(null);
    setTimeout(() => setConfirmationVisible(false), 20);
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <>
      <div className="areacsv">
        <form ref={detailsArea} onSubmit={(e) => {e.preventDefault(); return false;}} className="areacsvform areainvitecollabs">
          <h1 className="modal-title">Invite Collaborators</h1>
          <p>To add a collaborator, enter their email address. They will be sent a personal invitation link to create an account and join the simulation.</p>
          <div>
            <EmailInput>
              {emails.map((val, ind) => (
                <div>
                  <input 
                    type="text" 
                    placeholder="Email address" 
                    value={val} 
                    onChange={(e) => handleUpdateEmail(e.target.value, ind)} 
                  />
                  {ind !== 0 && (
                    <button type="button" className="removeuser" onClick={() => handleRemoveUser(ind)}>
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>
              ))}
              <button className="adduser" type="button" onClick={handleAddUser}>
                Add user +
              </button>
            </EmailInput>
            <Collaborators>
              <h3>People with access to {props.title}:</h3>
              {collaborators.length>0 ? collaborators.map(({adminid: id, name, email, verified}) => (
                <div>
                  <div>
                    {name ? (
                      <>
                      <h4>{name} {verified ? "(accepted)" : "(invited)"}</h4>
                      <p>{email}</p>
                      </>
                    ) : (
                      <h4>{email} {verified ? "(accepted)" : "(invited)"}</h4>
                    )}
                  </div>
                  <i className="fas fa-times-circle" onClick={() => handleOpenConfirm({id, name, email})}></i>
                </div>
              )) : <p>No one currently has access to {props.title}.</p>}
            </Collaborators>
          </div>
          <button 
            type="button" 
            className="modal-bottomright-button"
            onClick={handleSendEmails}
            disabled={sending}
          >
            Send
          </button>
        </form>
      </div>
      <ConfirmationModal
        visible={!!revokeUser}
        hide={hideConfirm}
        confirmFunction={handleRevokeUser}
        confirmMessage={"Yes"}
        message={revokeUser && `Revoke access to ${props.title} for ${revokeUser.name || revokeUser.email}?`}
      />
    </>
  );
}

export default InviteCollaboratorsModal;
