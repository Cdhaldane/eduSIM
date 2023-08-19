import React, { useState, useEffect, useRef } from "react";
import { MenuItems } from "./MenuItems";
import { withAuth0, useAuth0 } from "@auth0/auth0-react";
import ButtonLink from "../Buttons/ButtonLink";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from 'usehooks-ts'
import ProfileDropdown from "./ProfileDropdown";

import Home from "../../../public/icons/house.svg"
import Info from "../../../public/icons/info.svg"
import Gravatar from "react-gravatar";

import "./Navbar.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min";

import { supabase } from "../Supabase";
import { is } from "immutable";
import { set } from "draft-js/lib/EditorState";

const NavBar = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const profileDropdown = useRef(null);
  const { t, i18n } = useTranslation();
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)

  const toggleContextMenu = () => {
    setMenuOpen(!menuOpen);
  }

  useEffect(() => {
    setMenuOpen(props.show)
  },[props.show])

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

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {setIsAuthenticated(false)}
      if (event === 'SIGNED_IN') setIsAuthenticated(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setProfilePicture(session?.user?.user_metadata.avatar_url)
      if (session) setIsAuthenticated(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
          <Home alt={t("alt.home")} />
          {t("navbar.home")}
        </Link>

        <Link to="/about" className="nav-links">
          <Info />
          {t("navbar.about")}
        </Link>
        <a onClick={switchLanguage} className="lang-button">
          {i18n.language === 'en' ? 'fr' : 'en'}
        </a>
        {isAuthenticated ? (
          <>
            {profilePicture ? (
              <img
                referrerPolicy="no-referrer"
                className={menuOpen ? "nav-pic square" : "nav-pic"}
                src={session && session.user.user_metadata.picture}
                alt={t("alt.profile")}
                onClick={toggleContextMenu}
              />
            ) : <Gravatar email={session.user.email} className={menuOpen ? "nav-pic square" : "nav-pic"} onClick={toggleContextMenu} />
            }



          </>
        ) : (
          <div className="authen-button" onClick={() => setMenuOpen(true)}>Log in</div>
        )}

        {menuOpen && (
          <div ref={profileDropdown}>
            <ProfileDropdown open={menuOpen} close={toggleContextMenu} profile={isAuthenticated} />
          </div>
        )}
      </ul>

    </nav>
  );
}

export default withAuth0(NavBar);
