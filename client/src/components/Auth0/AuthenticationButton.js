import React from "react"
import Button from "../Buttons/Button"
import { useAuth0 } from '@auth0/auth0-react';
import "../Buttons/Buttons.css";

// async postData() {
//   try{
//     let result = await fetch("../../../server/models/AdminAccounts", {
//       method: "post",
//       mode: "no-cars",
//       headers: {
//         "Accept": "application/json",
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({
//         key1: "myusername"
//       })
//     });
//     console.log("Result: " + result)
//
// } catche(e) {
//   console.log(e)
//   }
// }


function AuthenticationButton(props) {
  const { isAuthenticated, loginWithRedirect, logout,  } = useAuth0();

  function handleClick(){
     loginWithRedirect({redirectUri: "http://localhost:3000/dashboard",})
  }

  return (
    isAuthenticated ?
    <Button onClick={() =>
      logout({
        returnTo: "http://localhost:3000/",
      })}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Logout</Button>:
    <Button onClick={handleClick}
    type="button"
    buttonStyle="btn--primary--solid"
    buttonSize="button--medium">Create Simulation</Button>
  );
}

export default AuthenticationButton;
