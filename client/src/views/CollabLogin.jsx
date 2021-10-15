import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
import { useAlertContext } from "../components/Alerts/AlertContext";
import axios from "axios";

function CollabLogin(props) {
  const { loginWithRedirect, user } = useAuth0();
  const alertContext = useAlertContext();

  const query = (new URLSearchParams(useLocation().search));

  const [email, setEmail] = useState(query.get("email"));
  const [sim, setSim] = useState(query.get("sim"));
  const [error, setError] = useState(!query.get("email") && !localStorage.inviteEmail);

  useEffect(() => {
    if (query.get("email") || localStorage.inviteEmail) {
      if (user) {
        if (user.email !== (query.get("email") || localStorage.inviteEmail)) {
          alertContext.showAlert("Please log in with the original email address you received the invite with.", "error");
          setError(true);
          return;
        };
        const s = query.get("sim") || localStorage.inviteSim;
        axios.post(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/verifyCollaborator', {
          email: user.email,
          name: user.name,
          gameinstanceid: s
        }).then((res) => {
          alertContext.showAlert("YES", "info");
          setEmail(user.email);
          setSim(s);
        }).catch((error) => {
          alertContext.showAlert("An error occured. The URL may be malformed, or the invite was invalid.", "error");
          setError(true);
        });
        localStorage.removeItem("inviteEmail");
        localStorage.removeItem("inviteSim");
      } else {
        localStorage.setItem("inviteEmail", query.get("email"));
        localStorage.setItem("inviteSim", query.get("sim"));
        loginWithRedirect({ redirectUri: window.location.href });
      }
    }
  }, []);

  if (error) return <p>error lol</p>;

  return user ? (
    <p>congrats youve been authorized into {sim}!</p>
  ) : (
    <p>taking you to the login...</p>
  );
}

export default CollabLogin;
