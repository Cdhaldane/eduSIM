import React, { useState } from "react"
import Button from "../Buttons/Button"
import { useAuth0 } from '@auth0/auth0-react';
import axios from "axios";
import "../Buttons/Buttons.css";

function AuthenticationButton(props) {
  const { isAuthenticated, loginWithRedirect, logout,  } = useAuth0();
  const { user } = useAuth0();
  console.log(localStorage)

  function handleClick(){
    loginWithRedirect({redirectUri: "http://localhost:3000/",})
    console.log(user.email)
    axios.get('http://localhost:5000/adminaccounts/getAdminbyEmail/:email/:name',{
      params: {
            email: user.email,
            name: user.name
        }
    })
    .then((res) => {
      const allData = res.data;
      localStorage.setItem('adminid', allData.adminid)
      console.log(localStorage.setItem('adminid', allData.adminid))
    })
    .catch(error => console.log(error.response));
  }

  function handleLogout(){
    logout({
      returnTo: "http://localhost:3000/",
    })
    localStorage.clear();
  }

  return (
    isAuthenticated ?
    <Button onClick={handleLogout}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Logout</Button>:
    <Button onClick={handleClick}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Create Simulation </Button>
  );
}

export default AuthenticationButton;
