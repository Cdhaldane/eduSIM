import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useHistory } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Header = styled.p`
  text-align: center;
  color: white;
  margin-top: 20px;
  font-size: 3em;
`;

const CollabLogin = (props) => {
  const { loginWithRedirect, user } = useAuth0();
  const alertContext = useAlertContext();
  let history = useHistory();

  const query = (new URLSearchParams(useLocation().search));

  useEffect(() => {
    if (query.get("email") || localStorage.inviteEmail) {
      if (user) {
        if (user.email !== (query.get("email") || localStorage.inviteEmail)) {
          alertContext.showAlert("Please log in with the original email address you received the invite with.", "error");
          history.push('/');
        } else {
          const s = query.get("sim") || localStorage.inviteSim;
          axios.post(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/verifyCollaborator', {
            email: user.email,
            name: user.name,
            gameinstanceid: s
          }).then((res) => {
            alertContext.showAlert("You have been granted access to a new simulation!", "info");
            history.push('/dashboard');
          }).catch((error) => {
            alertContext.showAlert("An error occured. The URL may be malformed, or the invite was invalid.", "error");
            history.push('/');
          });
        }
        localStorage.removeItem("inviteEmail");
        localStorage.removeItem("inviteSim");
      } else {
        localStorage.setItem("inviteEmail", query.get("email"));
        localStorage.setItem("inviteSim", query.get("sim"));
        loginWithRedirect({ redirectUri: window.location.href, prompt: "select_account" });
      }
    } else {
      history.push('/');
    }
  }, []);

  return (
    <Header>Taking you to the login...</Header>
  );
}

export default CollabLogin;
