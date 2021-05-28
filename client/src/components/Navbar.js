import React, {Component, useState} from "react";
import {MenuItems} from "./MenuItems";
import Button from "./Button.jsx"
import AuthenticationButton from "./AuthenticationButton"
import { withAuth0 } from "@auth0/auth0-react";



function NavBar(props) {
  const [count, setCount] = useState(false);


    const { user } = props.auth0
    const { picture, nickname } = user;

  const state = { clicked: false}
  function handleClick() {
    this.setState({clicked: !this.state.clicked})
  }


    return (
      <nav className="NavbarItems">
        <h1 className="navbar-logo">uOttawa<img className="img" src="favicon.ico" ></img></h1>
        <div className="menu-icon" onClick={handleClick}>
        <i className={state.clicked ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
      <ul className={state.clicked ? "nav-menu active" : "nav-menu"}>
        {MenuItems.map((item,index) =>{
          return (
            <li key={index}>
              <a className={item.cName} href={item.url} >
                {(item.title == "")
                ? <img className={item.cName} src={picture} onClick={() => setCount(!count)}/>
                : <a></a>
                }
                {item.title}
              </a>
            </li>
          )
        })}
        {(count == true)
        ? <div className={"profilevist"}>
          <h1>User:</h1>
          <h2>
            {nickname}
          <br />
          </h2>
          <a href="/profile">Modify Profile</a>
          <br />
        <div className="pbut">
            <AuthenticationButton />
          </div>
          </div>
        : <div className={"profilevisf"}>
          </div>
        }
      </ul>
      </nav>
    );
  }


export default withAuth0(NavBar);
