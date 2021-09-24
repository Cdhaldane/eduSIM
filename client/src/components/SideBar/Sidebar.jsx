import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Backdrop from "../../ui/Backdrop"
import NavLinksGroup from "./NavLinksGroup"
import NavToggle from "./NavToggle"
import Pencil from "../Pencils/Pencil";
import Messages from "./submenus/Messages";

const StyledNav = styled.nav`
  background-color: #8f001a;
  width: ${(p) => (p.compact ? "70px" : "256px")};
  height: 100vh;
  position: absolute;
  top: 0;
  left: ${(p) => (p.submenu ? "350px" : "0px")};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 1, 1), transform 0.3s cubic-bezier(0.4, 0, 1, 1), left 0.3s !important;
  overflow: hidden;
  &::before {
    content: "";
    background-color: #8f001a;
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  @media screen and (orientation: portrait) {
    width: 256px;
    transition: left 0.3s cubic-bezier(0, 0, 0.2, 1) !important;
    left: ${(p) => (p.compact ? "-256px" : "0")};
  }
`;

const Submenu = styled.div`
  width: 350px;
  background-color: white;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 999;
  transform: translateX(${(p) => (p.open ? "0" : "-100%")});
  transition-property: transform;
  transition-duration: .3s;
  & > .hidden {
    display: none;
  }
  @media screen and (orientation: portrait) {
    transition-property: 
      ${(p) => p.open ? "width" : "width, transform"} !important;
    transition-timing-function: ${(p) => p.open ? "cubic-bezier(0, 0, 0.2, 1)" : "cubic-bezier(0, 0, 0.31, 1)" } !important;
    width: ${(p) => (p.open ? "350px" : "256px")};
  }
`;

function Sidebar(props) {
  const sidebarRef = useRef();
  const [compact, setCompact] = useState(0);
  const [submenu, setSubmenu] = useState(null);
  const [submenuVisible, setSubmenuVisible] = useState(false);

  const [mvisible, setMvisible] = useState("false")
  const [avisible, setAvisible] = useState("false")
  const [pavisible, setPavisible] = useState("false")
  const [svisible, setSvisible] = useState("false")
  const [pevisible, setPevisible] = useState("false")

  function handleMvisible(e) {
    setMvisible(e);
  }
  function handleAvisible(e) {
    setAvisible(e);
  }
  function handlePavisible(e) {
    setPavisible(e);
  }
  function handleSvisible(e) {
    setSvisible(e);
  }
  function handlePevisible(e) {
    setPevisible(e);
  }
  
  const handleClickOutside = e => {
    if (!sidebarRef.current.contains(e.target)) {
      props.close();
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const onNavClick = (nav) => {
    if (links.find(({ id }) => id === nav).submenu) {
      if (submenu != nav || !submenuVisible) {
        setSubmenu(nav);
        setSubmenuVisible(true);
        setCompact(true);
      } else {
        setCompact(false);
        setSubmenuVisible(false);
      }
    }
  };

  const toggleCompact = (val) => {
    setCompact(val);
    if (!val) {
      setSubmenuVisible(false);
    }
  }
  
  const links = [
    {
      img: props.img,
      label: props.title,
      sublabel: props.subtitle,
      id: "title",
      visible: true,
      icon: null,
      submenu: (
        <p>hello</p>
      )
    },
    {
      icon: "fas fa-comment-dots",
      label: "Messaging",
      visible: mvisible,
      id: "messaging",
      submenu: (
        <Messages socket={props.socket} />
      )
    },
    {
      to: "/alert",
      icon: "fas fa-bell",
      id: "alert",
      label: "Alert",
      visible: avisible
    },
    {
      to: "/parameters",
      icon: "fas fa-sliders-h",
      id: "parameters",
      label: "Parameters",
      visible: pavisible
    },
    {
      to: "/settings",
      icon: "fas fa-cog",
      id: "settings",
      label: "Settings",
      visible: svisible

    },
    {
      to: "/performance",
      icon: "fas fa-chart-bar",
      id: "performance",
      label: "Performance",
      visible: pevisible
    },
  ];

  return (
    <div ref={sidebarRef}>
      <Backdrop visible={props.visible} onClick={props.close} />
      <Submenu open={submenuVisible && compact}>
        {links.map(({ id, submenu: el }) => (
          el && (
            <div className={id !== submenu && "hidden"}>{el}</div>
          )
        ))}
      </Submenu>
      <StyledNav compact={!compact || submenuVisible} submenu={submenuVisible} {...props}>
        <NavLinksGroup 
          compact={!compact || submenuVisible}
          links={links}
          action={onNavClick}
        />

        <NavToggle compact={!compact} submenu={submenuVisible} setCompact={toggleCompact} />
        
        <Pencil
          id="4"
          psize="2"
          type="nav"
          title=""
          hidden={!compact}
          submenu={submenuVisible}
          mvisible={handleMvisible}
          avisible={handleAvisible}
          pavisible={handlePavisible}
          svisible={handleSvisible}
          pevisible={handlePevisible}
        />
      </StyledNav>
    </div>
  );
}
export default Sidebar;
