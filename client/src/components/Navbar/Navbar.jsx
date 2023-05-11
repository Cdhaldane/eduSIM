import React, { useState, useEffect, useRef } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from 'usehooks-ts'

import Home from "../../../public/icons/house.svg"
import Info from "../../../public/icons/info.svg"

import "./Navbar.css";

const NavBar = (props) => {
  const { isAuthenticated } = useAuth0();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = props.auth0;
  const profileDropdown = useRef(null);
  const { t, i18n } = useTranslation();
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

  const toggleContextMenu = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdown.current && !profileDropdown.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  const switchLanguage = () => {
    if (i18n.language === 'en') {
      i18n.changeLanguage('fr');
      localStorage.setItem('lang', 'fr');
    } else {
      i18n.changeLanguage('en');
      localStorage.setItem('lang', 'en');
    }
  };

  return (
    <nav className="NavbarItems">
      <a href="/">
        <div className="logo-container">
          <img src="/assets/03_eduSIM_horizontal.png" className="navbar-logo" alt={t("alt.navbar")}></img>
          <div className="vl"></div>
          <h1 className="title">{t("navbar.title")}</h1>
        </div>
      </a>
      <div className="menu-icon" onClick={toggleContextMenu}>
        <i className={menuOpen ? "menu-close fas fa-times" : "menu-close fas fa-bars"}></i>
      </div>
      <div className={menuOpen ? "nav-menu active" : "nav-menu"} ref={profileDropdown}>
        {isAuthenticated && (
          <div
            ref={profileDropdown}
            className={`profilevist ${menuOpen ? "" : "profilevist-closed"}`}
          >
            <h2>{user.name}</h2>
            <div className="profilevist-container">
              <Link onClick={() => setMenuOpen(false)} to={`/profile/${localStorage.adminid}`} className="authen-button navbar-w-button" type="button">{t("navbar.profile")}</Link>
              <AuthenticationButton onClick={() => setMenuOpen(false)} className={"authen-button navbar-w-button"} />
            </div>
          </div>
        )}
        <ButtonLink
          className={"nav-links-icons"}
          href="/dashboard"
          buttonStyle="btn--danger--solid"
          buttonSize="button--medium"
        >
          <Home className="icon navbar-icons custom-icons" alt={t("alt.home")} />
          {t("navbar.home")}
        </ButtonLink>
        <ButtonLink
          className={"nav-links-icons"}
          href="/about"
          buttonStyle="btn--danger--solid"
          buttonSize="button--medium"
        >
          <Info className="icon information navbar-icons" />
          {t("navbar.about")}
        </ButtonLink>
        <button onClick={switchLanguage} className={menuOpen ? "lang-button" : "lang-button"}>
          {i18n.language === 'en' ? 'fr' : 'en'}
        </button>


        {isAuthenticated ? (
          <img
            referrerPolicy="no-referrer"
            className={menuOpen ? "nav-pic square" : "nav-pic"}
            src={user ? user.picture : ""}
            alt={t("alt.profile")}
            onClick={toggleContextMenu}
          />
        ) : (
          <AuthenticationButton className={"authen-button"}/>
        )}
      </div>
    </nav>
  );
}

export default withAuth0(NavBar);
