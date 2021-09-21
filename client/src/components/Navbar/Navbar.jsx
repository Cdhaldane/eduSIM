import React, { useState, useEffect, useRef } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";
import { Link } from "react-router-dom";

import "./Navbar.css";

function NavBar(props) {
  const { isAuthenticated } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = props.auth0;
  const profileDropdown = useRef();

  function toggleContextMenu() {
    setMenuOpen(!menuOpen);
    if (!menuOpen === true) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }

  const handleClickOutside = e => {
    if (!profileDropdown.current.contains(e.target)) {
      setMenuOpen(false);
      document.removeEventListener('click', handleClickOutside);
    }
  };

  useEffect(() => {
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="NavbarItems">
      <a href="/">
        <h4 className="navbar-logo">eduSIM - Educational Simulator Tool</h4>
      </a>
      <div className="menu-icon" onClick={toggleContextMenu}>
        <i className={menuOpen ? "menu-close fas fa-times" : "menu-close fas fa-bars"}></i>
      </div>
      <div className={menuOpen ? "nav-menu active" : "nav-menu"}>
        {isAuthenticated && (
          <div
            ref={profileDropdown}
            className={`profilevist ${menuOpen ? "profilevist-open" : "profilevist-closed"}`}
          >
            <h2>{user.name}</h2>
            <Link to="/dashboard" className="nav-home-mobile">
              <i
                class="fa fa-home"
                aria-hidden="true"
              ></i>
            </Link>
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

        <Link to="/dashboard" className="nav-home">
          <i
            class="fa fa-home"
            aria-hidden="true"
          ></i>
        </Link>

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
