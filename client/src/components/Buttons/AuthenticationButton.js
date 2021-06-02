import React from "react"
import Button from "./Button"
import { useAuth0 } from '@auth0/auth0-react';
import "./Buttons.css";

function AuthenticationButton(props) {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  return (
    isAuthenticated ?
    <Button onClick={() =>
      logout({
        returnTo: "http://localhost:3000/",
      })}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Logout</Button>:
    <Button onClick={() => loginWithRedirect({redirectUri: "http://localhost:3000/dashboard",})}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Create Simulation</Button>
  );
}

export default AuthenticationButton;
