import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import Backdrop from "../../ui/Backdrop";
import NavLinksGroup from "./NavLinksGroup";
import NavToggle from "./NavToggle";
import Pencil from "../Pencils/Pencil";
import Messages from "./submenus/Messages";
import Settings from "./submenus/Settings";
import Alerts from "./submenus/Alerts";
import Modal from "react-modal";
import Performance from "./Performance";

const StyledNav = styled.nav`
  background-color: var(--primary);
  width: ${(p) => (p.compact ? "70px" : "256px")};
  height: 100vh;
  position: absolute;
  top: 0;
  left: ${(p) => (p.submenu ? "350px" : "0px")};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition-property: width, transform, left !important;
  transition-duration: .3s !important;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important;
  overflow: hidden;
  &::before {
    content: "";
    /*background-color: var(--primary);*/
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
  transition-property: transform !important;
  transition-duration: .3s !important;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important;
  & > .hidden {
    display: none;
  }
  & > div {
    height: inherit;
  }
  @media screen and (orientation: portrait) {
    transition-property: 
      ${(p) => p.open ? "width" : "width, transform"} !important;
    transition-timing-function: ${(p) => p.open ? "cubic-bezier(0, 0, 0.2, 1)" : "cubic-bezier(0, 0, 0.31, 1)"} !important;
    width: ${(p) => (p.open ? "350px" : "256px")};
  }
`;

const Disabled = styled.div`
  ${(p) => p.disabled && `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

const Sidebar = (props) => {
  const sidebarRef = useRef();
  const backdropRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const [submenu, setSubmenu] = useState(null);
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [navCountTickers, setNavCountTickers] = useState({});

  const [mvisible, setMvisible] = useState("false");
  const [avisible, setAvisible] = useState("false");
  const [pavisible, setPavisible] = useState("false");
  const [svisible, setSvisible] = useState("false");
  const [pevisible, setPevisible] = useState("false");

  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const performanceModal = new useRef();
  const performanceBtn = new useRef();

  const handleMvisible = (e) => {
    setMvisible(e);
  }
  const handleAvisible = (e) => {
    setAvisible(e);
  }
  const handlePavisible = (e) => {
    setPavisible(e);
  }
  const handleSvisible = (e) => {
    setSvisible(e);
  }
  const handlePevisible = (e) => {
    setPevisible(e);
  }

  const handleClickOutside = e => {
    if ((!sidebarRef.current.contains(e.target) || backdropRef.current.contains(e.target)) &&
      !e.target.className.includes('remove-whisper')) {
      setExpanded(false);
      setSubmenuVisible(false);
    }

    if (performanceModal.current && performanceBtn.current &&
      !(performanceModal.current.contains(e.target) || performanceBtn.current.contains(e.target))) {
      setShowPerformanceModal(false);
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const onNavClick = (nav) => {
    if (links.find(({ id }) => id === nav).submenu && !props.disabled) {
      if (submenu != nav || !submenuVisible) {
        setNavCountTickers(old => ({
          ...old,
          [nav]: 0
        }));
        setSubmenu(nav);
        setSubmenuVisible(true);
        setExpanded(true);
      } else {
        setSubmenuVisible(false);
        setExpanded(false);
      }
    }

    switch (nav) {
      case "performance":
        setTimeout(setShowPerformanceModal(true));
        break;
    }
  };

  useEffect(() => {
    setExpanded(false);
    setSubmenuVisible(false);
  }, [props.disabled]);

  const toggleCompact = (val) => {
    if (!props.disabled) {
      setExpanded(val);
      if (!val) {
        setSubmenuVisible(false);
      }
    }
  }

  const handleIncrementTicker = useCallback((id) => {
    setNavCountTickers(old => ({
      ...old,
      [id]: (old[id] || 0)+1
    }));
  }, [submenu]);

  useEffect(() => {
    if (Object.keys(navCountTickers).length>0 && submenuVisible) {
      setNavCountTickers(old => Object.entries(old).reduce((prev, [key, val]) => ({
        ...prev,
        [key]: (submenu == key) ? 0 : val
      }, {})));
    }
  }, [submenu, submenuVisible, navCountTickers]);

  const links = [
    {
      img: props.img,
      label: props.title,
      sublabel: props.subtitle,
      id: "title",
      visible: true,
      icon: null
    },
    {
      icon: "fas fa-comment-dots",
      label: "Messaging",
      visible: mvisible,
      id: "messaging",
      submenu: (
        <Messages 
          incrementTicker={() => handleIncrementTicker("messaging")}
          socket={props.socket} 
          messageBacklog={props.submenuProps?.messageBacklog}
        />
      )
    },
    {
      to: "/alert",
      icon: "fas fa-bell",
      id: "alert",
      label: "Alert",
      visible: avisible,
      submenu: (
        <Alerts 
          editpage={!props.game}
          {...props.alertProps}
        />
      )
    },
    {
      to: "/performance",
      icon: "fas fa-chart-bar",
      id: "performance",
      label: "Performance",
      visible: pevisible
    },
    {
      icon: "fas fa-cog",
      id: "settings",
      label: "Settings",
      visible: svisible,
      submenu: (
        <Settings />
      )
    },
  ];

  return (
    <>
      <div ref={sidebarRef}>
        <Backdrop visible={expanded} onClick={props.close} ref={backdropRef}/>
        <Submenu open={submenuVisible && expanded}>
          {links.map(({ id, submenu: el }, index) => (
            el && (
              <div key={index} className={(id !== submenu ? "hidden" : "")}>{el}</div>
            )
          ))}
        </Submenu>
        <StyledNav compact={!expanded || submenuVisible} submenu={submenuVisible} {...props}>
          <NavLinksGroup
            isPlayMode={props.game}
            compact={!expanded || submenuVisible}
            links={links}
            action={onNavClick}
            disabled={props.disabled}
            ref={performanceBtn}
            counts={navCountTickers}
          />

          <NavToggle
            compact={!expanded}
            submenu={submenuVisible}
            setExpanded={toggleCompact}
            disabled={props.disabled}
          />

          {!props.game && (
            <Disabled disabled={props.disabled}>
              <Pencil
                id="4"
                psize="2"
                type="nav"
                title=""
                hidden={!expanded}
                submenu={submenuVisible}
                mvisible={handleMvisible}
                avisible={handleAvisible}
                pavisible={handlePavisible}
                svisible={handleSvisible}
                pevisible={handlePevisible}
              />
            </Disabled>
          )}

        </StyledNav>
      </div>
      <Modal
        isOpen={showPerformanceModal}
        onRequestClose={() => setShowPerformanceModal(false)}
        className="createmodalarea"
        overlayClassName="myoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <Performance
          userId={props.userId}
          status={props.gamepieceStatus}
          customObjs={props.customObjs}
          ref={performanceModal}
          setData={props.performanceFunctions}
        />
      </Modal>
    </>
  );
}
export default Sidebar;
