import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { useAlertContext } from '../Alerts/AlertContext';
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
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
    font-size: 1.0em;
    padding: 5px;
    border-radius: 30px;
    border: 1px solid var(--text-color);
  }
  & .adduser {
    --color: rgb(161, 255, 148);
    border: 2px outset rgb(136, 136, 136);
    background-color: var(--color);
    border-color: var(--color);
    font-family: "Montserrat", sans-serif;
    font-size: 1.2rem;
    margin: 0px;
    padding: 5px;
    border-radius: 5px;
    display: inline-block;
  }
  & .removeuser {
    --color: #ff9898;
    color: var(--dark);
    border: 2px outset rgb(136, 136, 136);
    border-radius:100px;
    background-color: var(--color);
    border-color: var(--color);
    margin-left: 5px;
    font-size: 1.0em;
    padding: 6px;
    cursor: pointer;

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

const InviteCollaboratorsModal = (props) => {
  const detailsArea = new useRef();
  const [emails, setEmails] = useState([""]);
  const [sending, setSending] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const alertContext = useAlertContext();
  const { user } = useAuth0();
  const [revokeUser, setRevokeUser] = useState(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const { t } = useTranslation();

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
      alertContext.showAlert(t("alert.inviteSuccessful"), "info");
      props.close();
      setSending(false);
    }).catch((error) => {
      console.log(error);
      if (error) {
        alertContext.showAlert(t("alert.inviteError"), "error");
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
          <h1 className="modal-title">{t("modal.inviteCollaborators")}</h1>
        <p className="left-align">{t("modal.inviteCollaboratorsExplanation")}</p>
          <div>
            <EmailInput>
              {emails.map((val, ind) => (
                <div>
                  <input
                    type="text"
                    placeholder={t("modal.emailAddress")}
                    value={val}
                    onChange={(e) => handleUpdateEmail(e.target.value, ind)}
                  />
                  {ind !== 0 && (
                    <button type="button" className="removeuser" onClick={() => handleRemoveUser(ind)}>
                      <i className="lni lni-close"></i>
                    </button>
                  )}
                </div>
              ))}
              <button className="adduser" type="button" onClick={handleAddUser}>
                {t("modal.addUser")}
              </button>
            </EmailInput>
            <Collaborators>
              <h3>{t("modal.peopleWithAccessToX", { name: props.title })}</h3>
              {collaborators.length>0 ? collaborators.map(({adminid: id, name, email, verified}) => (
                <div>
                  <div>
                    {name ? (
                      <>
                      <h4>{name} {verified ? t("modal.suffixAccepted") : t("modal.suffixInvited")}</h4>
                      <p>{email}</p>
                      </>
                    ) : (
                      <h4>{email} {verified ? t("modal.suffixAccepted") : t("modal.suffixInvited")}</h4>
                    )}
                  </div>
                  <i className="lni lni-close" onClick={() => handleOpenConfirm({id, name, email})}></i>
                </div>
              )) : <p>{t("modal.nobodyHasAccessToX", { name: props.title })}</p>}
            </Collaborators>
          </div>
          <p className="button-container fix">
          <button
            type="button"
            className="modal-button green"
            onClick={handleSendEmails}
            disabled={sending}
          >
            {t("modal.send")}
          </button>
          <button type="button" className="red" onClick={props.close}>
            {t("common.cancel")}
          </button>
        </p>
        </form>
      </div>
      <ConfirmationModal
        visible={!!revokeUser}
        hide={hideConfirm}
        confirmFunction={handleRevokeUser}
        confirmMessage={t("modal.confirmRevokeAccess")}
        message={revokeUser && t("modal.revokeAccessToXForY", { name: props.title, person: revokeUser.name || revokeUser.email})}
      />
    </>
  );
}

export default InviteCollaboratorsModal;
