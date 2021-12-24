import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { useAlertContext } from "../components/Alerts/AlertContext";
import { useHistory } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const query = (new URLSearchParams(useLocation().search));

  useEffect(() => {
    if (query.get("email") || localStorage.inviteEmail) {
      if (user) {
        if (user.email !== (query.get("email") || localStorage.inviteEmail)) {
          alertContext.showAlert(t("alert.useOriginalEmail"), "error");
          history.push('/');
        } else {
          const s = query.get("sim") || localStorage.inviteSim;
          axios.post(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/verifyCollaborator', {
            email: user.email,
            name: user.name,
            gameinstanceid: s
          }).then((res) => {
            alertContext.showAlert(t("alert.simAccessGranted"), "info");
            history.push('/dashboard');
          }).catch((error) => {
            alertContext.showAlert(t("alert.inviteInvalid"), "error");
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
