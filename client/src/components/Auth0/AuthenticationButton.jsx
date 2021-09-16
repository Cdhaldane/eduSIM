import React from "react";
import Button from "../Buttons/Button";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import "../Buttons/Buttons.css";

function AuthenticationButton(props) {
  const { isAuthenticated, loginWithRedirect, logout, } = useAuth0();
  const { user } = useAuth0();

  function handleClick() {
    loginWithRedirect({ redirectUri: window.location.origin });
    axios.get(process.env.REACT_APP_API_ORIGIN + '/adminaccounts/getAdminbyEmail/:email/:name', {
      params: {
        email: user.email,
        name: user.name
      }
    }).then((res) => {
      const allData = res.data;
      localStorage.setItem('adminid', allData.adminid);
    }).catch(error => {
      console.error(error);
    });
  }

  function handleLogout() {
    logout({
      returnTo: window.location.origin,
    });
    localStorage.clear();
  }

  return isAuthenticated ? (
    <Button
      onClick={handleLogout}
      type="button"
      buttonStyle="btn--primary--solid"
      buttonSize="button--medium"
    >
      Logout
    </Button>
  ) : (
    <Button
      onClick={handleClick}
      type="button"
      buttonStyle="btn--primary--solid"
      buttonSize="button--medium"
    >
      Login
    </Button>
  );
}

export default AuthenticationButton;
