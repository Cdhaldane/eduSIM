import React, { useState } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton"
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import "./Navbar.css";

function NavBar(props) {
  const [count, setCount] = useState(false);
  const { isAuthenticated } = useAuth0();
  const [clicked, setClicked] = useState(false);
  const { user } = props.auth0;

  function handleClick() {
    setClicked(!clicked);
  }

  return (
    <nav className="NavbarItems">
      <a href="/"><h1 className="navbar-logo">eduSIM<img className="img" alt="eduSIM logo" src="favicon.ico" ></img></h1></a>
      <div className="menu-icon" onClick={handleClick}>
        <i className={clicked ? "fas fa-times" : "fas fa-bars"}></i>
      </div>
      <ul className={clicked ? "nav-menu active" : "nav-menu"}>
        <div>
          {(isAuthenticated)
            ? <img className="nav-pic" src={user.picture} alt="profile" onClick={() => setCount(!count)} />
            : <p className="nav-picbutton"><AuthenticationButton /></p>
          }
        </div>
        {MenuItems.map((item, index) => {
          return (
            <li key={index}>
              <a className={item.cName} href={item.url} >
                {item.title}
              </a>
            </li>
          )
        })}

        {(count === true)
          ? <div className={"profilevist"}>
            {(isAuthenticated)
              ? <h2>{user.name}</h2>
              : <h2>Nothing</h2>
            }
            <br />
            <a href="/profile">Profile </a>
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
