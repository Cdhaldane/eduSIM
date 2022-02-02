import React, { useState, useEffect, useRef } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Navbar.css";

const NavBar = (props) => {
  const { isAuthenticated } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = props.auth0;
  const profileDropdown = useRef();
  const { t } = useTranslation();

  const toggleContextMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen === true) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  }

  const handleClickOutside = e => {
    if (profileDropdown.current && !profileDropdown.current.contains(e.target)) {
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
        <div className="logo-container">
          <img src="03_eduSIM_horizontal.png" className="navbar-logo"></img>
          <div className="vl"></div>
          <h1 className="title">{t("navbar.title")}</h1>
        </div>
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
            <Link to="/profile" className="w-button " type="button">{t("navbar.profile")}</Link>

            <AuthenticationButton />
          </div>
        )}
            <ButtonLink
              className="nav-links"
              href="/dashboard"
              buttonStyle="btn--danger--solid"
              buttonSize="button--medium"
            >
              <i class="fas fa-home"></i>
            </ButtonLink>
            <ButtonLink
              className="nav-links"
              href="/about"
              buttonStyle="btn--danger--solid"
              buttonSize="button--medium"
            >
              <i className="fas fa-info-circle"></i>
              {t("navbar.about")}
            </ButtonLink>


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
