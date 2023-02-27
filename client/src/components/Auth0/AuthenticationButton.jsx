import React, { useEffect } from "react";
import Button from "../Buttons/Button";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../Buttons/Buttons.css";

const AuthenticationButton = (props) => {
  const { isAuthenticated, loginWithRedirect, logout, } = useAuth0();
  const { user } = useAuth0();
  const { t } = useTranslation();

  useEffect(() => {
    if(user)
      axios.get(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/getAdminbyEmail/:email/:name', {
        params: {
          email: user.email,
          name: user.name,
        }
      }).then((res) => {
        const allData = res.data;
        localStorage.setItem('adminid', allData.adminid);
        let body = {
          email: user.email,
          picture: user.picture,
        }
        axios.put(process.env.REACT_APP_API_ORIGIN + '/api/adminaccounts/update/:email', body).then((res) => {
          console.log(res.data)
        })
      }).catch(error => {
        console.error(error);
      });
  }, [user])

  const handleClick = () => {
    loginWithRedirect({ redirectUri: window.location.origin, prompt: "select_account" });
  }

  const handleLogout = () => {
    logout({
      returnTo: window.location.origin,
    });
    localStorage.clear();
  }

  return isAuthenticated ? (
    <button
      onClick={handleLogout}
      type="button"
      className="w-button"
    >
      {t("navbar.logout")}
    </button>
  ) : (
    <button
      onClick={handleClick}
      type="button"
      className="w-button small"
    >
      {t("navbar.login")}
    </button>
  );
}

export default AuthenticationButton;
