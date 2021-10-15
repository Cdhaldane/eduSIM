import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useAlertContext } from '../Alerts/AlertContext';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const EmailInput = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  align-items: flex-start;
  overflow-y: auto;
  margin-bottom: 10px;
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

function InviteCollaboratorsModal(props) {
  const detailsArea = new useRef();
  const [emails, setEmails] = useState([""]);
  const [sending, setSending] = useState(false);
  const alertContext = useAlertContext();
  const { user } = useAuth0();
  
  const handleClickOutside = e => {
    if (detailsArea.current &&
      !(detailsArea.current.contains(e.target))) {
      props.close();
    }
  };

  const handleUpdateEmail = (val, ind) => {
    console.log(val, ind);
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

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="areacsv">
      <form ref={detailsArea} className="areacsvform areainvitecollabs">
        <h1 className="modal-title">Invite Collaborators</h1>
        <p>To add a collaborator, enter their email address. They will be sent a personal invitation link to create an account and join the simulation.</p>
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
                  <i class="fas fa-times-circle"></i>
                </button>
              )}
            </div>
          ))}
          <button className="adduser" type="button" onClick={handleAddUser}>
            Add user +
          </button>
        </EmailInput>
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
  );
}

export default InviteCollaboratorsModal;
