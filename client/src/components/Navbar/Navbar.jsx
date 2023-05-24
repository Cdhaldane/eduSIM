import React, { useState, useEffect, useRef } from "react";
import { MenuItems } from "./MenuItems";
import AuthenticationButton from "../Auth0/AuthenticationButton";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from 'usehooks-ts'
import ProfileDropdown from "./ProfileDropdown";

import Home from "../../../public/icons/house.svg"
import Info from "../../../public/icons/info.svg"

import "./Navbar.css";
import Profile from "../../views/Profile";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

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
          <img src="/assets/03_eduSIM_horizontal.png" className="navbar-logo" alt={t("alt.navbar")}></img>
          <div className="vl"></div>
          <h1 className="title">{t("navbar.title")}</h1>
      </a>
      <div className="menu-icon" onClick={toggleContextMenu}>
        <i className={menuOpen ? "menu-close fas fa-times" : "menu-close fas fa-bars"}></i>
      </div>
      <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
     
        <Link to="/dashboard" className="nav-links">
          <Home  alt={t("alt.home")} />
          {t("navbar.home")}
        </Link>

        <Link to="/about" className="nav-links">
          <Info  />
          {t("navbar.about")}
        </Link>
        <a onClick={switchLanguage} className="lang-button">
          {i18n.language === 'en' ? 'fr' : 'en'}
        </a>
  
        {isAuthenticated ? (
          <img
            referrerPolicy="no-referrer"
            className={menuOpen ? "nav-pic square" : "nav-pic"}
            src={user ? user.picture : ""}
            alt={t("alt.profile")}
            onClick={toggleContextMenu}
          />

        ) : (
          <AuthenticationButton className={"authen-button"} />
        )}

        {isAuthenticated && menuOpen && (
          <div ref={profileDropdown}>
          <ProfileDropdown user={user} open={menuOpen} close={toggleContextMenu} />
          </div>
        )}
      </ul>

    </nav>
  );
}

export default withAuth0(NavBar);
