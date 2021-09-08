import React, { useState } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";

import "./Navbar.css";

function NavBar(props) {
  const { isAuthenticated } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = props.auth0;

  function toggleContextMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <nav className="NavbarItems">
      <a href="/">
        <h4 className="navbar-logo">eduSIM - Educational Simulator Tool</h4>
      </a>
      <div className="menu-icon" onClick={toggleContextMenu}>
        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
      </div>
      <div className={menuOpen ? "nav-menu active" : "nav-menu"}>
        {isAuthenticated && (
          <div
            className={`profilevist ${
              menuOpen ? "profilevist-open" : "profilevist-closed"
            }`}
          >
            <h2>{user.name}</h2>
            <ButtonLink
              href="/profile"
              buttonStyle="btn--primary--solid"
              buttonSize="button--medium"
            >
              Profile{" "}
            </ButtonLink>
            <AuthenticationButton />
          </div>
        )}

        {MenuItems.map((item, index) => {
          return (
            <ButtonLink
              buttonStyle="btn--primary--solid"
              buttonSize="button--medium"
              className={item.cName}
              href={item.url}
              key={index}
            >
              {item.title}
            </ButtonLink>
          );
        })}

        {isAuthenticated ? (
          <img
            className="nav-pic"
            src={user.picture}
            alt="profile"
            onClick={toggleContextMenu}
          />
        ) : (
          <AuthenticationButton />
        )}
      </div>
    </nav>
  );
}

export default withAuth0(NavBar);
