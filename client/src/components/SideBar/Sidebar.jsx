import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import Backdrop from "../../ui/Backdrop";
import NavLinksGroup from "./NavLinksGroup";
import NavToggle from "./NavToggle";
import Pencil from "../Pencils/Pencil";
import Messages from "./submenus/Messages";
import Modal from "react-modal";
import Performance from "./Performance";

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
  transition-property: width, transform, left !important;
  transition-duration: .3s !important;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important;
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
  const [compact, setCompact] = useState(0);
  const [submenu, setSubmenu] = useState(null);
  const [submenuVisible, setSubmenuVisible] = useState(false);

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
    if (!sidebarRef.current.contains(e.target)) {
      props.close();
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
        setSubmenu(nav);
        setSubmenuVisible(true);
        setCompact(true);
      } else {
        setCompact(false);
        setSubmenuVisible(false);
      }
    }

    switch (nav) {
      case "performance":
        setTimeout(setShowPerformanceModal(true));
        break;
    }
  };

  const toggleCompact = (val) => {
    if (!props.disabled) {
      setCompact(val);
      if (!val) {
        setSubmenuVisible(false);
      }
    }
  }

  useEffect(() => {
    setCompact(false);
    setSubmenuVisible(false);
  }, [props.disabled]);

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
        <Messages socket={props.socket} messageBacklog={props.submenuProps?.messageBacklog} />
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
      to: "/performance",
      icon: "fas fa-chart-bar",
      id: "performance",
      label: "Performance",
      visible: pevisible
    },
    {
      to: "/settings",
      icon: "fas fa-cog",
      id: "settings",
      label: "Settings",
      visible: svisible

    },
  ];

  console.log(props);

  return (
    <>
      <div ref={sidebarRef}>
        <Backdrop visible={compact} onClick={props.close} />
        <Submenu open={submenuVisible && compact}>
          {links.map(({ id, submenu: el }, index) => (
            el && (
              <div key={index} className={(id !== submenu ? "hidden" : "")}>{el}</div>
            )
          ))}
        </Submenu>
        <StyledNav compact={!compact || submenuVisible} submenu={submenuVisible} {...props}>
          <NavLinksGroup
            isPlayMode={props.game}
            compact={!compact || submenuVisible}
            links={links}
            action={onNavClick}
            disabled={props.disabled}
            ref={performanceBtn}
          />

          <NavToggle
            compact={!compact}
            submenu={submenuVisible}
            setCompact={toggleCompact}
            disabled={props.disabled}
          />

          {!props.game && (
            <Disabled disabled={props.disabled}>
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
          customObjs={props.customObjs}
          ref={performanceModal}
        />
      </Modal>
    </>
  );
}
export default Sidebar;
