import React, { useState } from "react"
import Button from "../Buttons/Button"
import { useAuth0 } from '@auth0/auth0-react';
import axios from "axios";
import "../Buttons/Buttons.css";

function AuthenticationButton(props) {
  const { isAuthenticated, loginWithRedirect, logout,  } = useAuth0();
  const [ login, setLogin ] =useState([]);
  const { user } = useAuth0();



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
      console.log(allData);
      setLogin(allData.adminid);
      localStorage.setItem('adminid', allData.adminid)
      console.log(localStorage)
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

// let data = {
//   email: "email",
//   name: "name",
//   picture: "picture"
// }
//
// let config = {
//   headers: {
//     "Content-Type": "application/json",
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type'
//     }
//   }
//
//   axios.post('http://localhost:5000/adminaccounts/createAdmin', data, config)
//      .then((res) => {
//         console.log(res)
//        })
//       .catch((err) => {
//         console.log(err.response.data)
//      });
//    }
//
