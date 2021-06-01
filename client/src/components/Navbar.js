import React, {Component, useState} from "react";
import {MenuItems} from "./MenuItems";
import Button from "./Button.jsx"
import AuthenticationButton from "./AuthenticationButton"
import { withAuth0, useAuth0 } from "@auth0/auth0-react";

function NavBar(props) {
  const [count, setCount] = useState(false);
  const { isAuthenticated } = useAuth0();
  const { user } = props.auth0;
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
        <div className="pp">
        {(isAuthenticated)
        ? <img className="nav-pic" src={ user.picture } onClick={() => setCount(!count)}/>
        : <AuthenticationButton />
    }
        </div>
        {MenuItems.map((item,index) =>{
          return (
            <li key={index}>
              <a className={item.cName} href={item.url} >
                {item.title}
              </a>
            </li>
          )
        })}
        {(count == true)
        ? <div className={"profilevist"}>
            {(isAuthenticated)
            ? <h2>{user.name}</h2>
            : <h2>Nothing</h2>
          }
          <br />
          <a href="/profile">Profile</a>
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
