import React, { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Backdrop from "../../ui/Backdrop";
import NavLinksGroup from "./NavLinksGroup";
import NavToggle from "./NavToggle";
import Pencil from "../Pencils/Pencil";

import Messages from "./submenus/Messages";
import Settings from "./submenus/Settings";
import Variables from "./submenus/Variables/Variables";
import Notes from "./submenus/Notes";
import Alerts from "./submenus/Alerts";
import Players from "./submenus/Players";
import Themes from "./submenus/Themes";

import Modal from "react-modal";
import Performance from "./Performance";
import { useTranslation } from "react-i18next";
import { Image } from "cloudinary-react";

const StyledNav = styled.nav`
  background-color: var(--white);
  box-shadow: var(--box-shadow);
  width: ${(p) => (p.compact ? "70px" : "256px")};
  height: 100vh;
  position: absolute;
  top: 0px;
  bottom: 0px;
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
  const [showVariables, setShowVariables] = useState(false);
  const performanceModal = new useRef();
  const performanceBtn = new useRef();

  const { t } = useTranslation();

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
    if ((!sidebarRef.current?.contains(e.target) || backdropRef.current.contains(e.target)) &&
      !e.target.className.toString().includes('remove-whisper')) {
      setExpanded(false);
      setSubmenuVisible(false);
      props.close(false);
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

  const closePerformance = () => {
    setShowVariables(false)
  }

  const onNavClick = (nav) => {
    if (links.find(({ id }) => id === nav).submenu && !props.disabled) {
      if (submenu != nav || !submenuVisible) {
        setSubmenu(nav);
        setSubmenuVisible(true);
        setExpanded(true);
        props.close(true);
      } else {
        setSubmenuVisible(false);
        setExpanded(false);
        props.close(false);
      }
    }

    switch (nav) {
      case "performance":
        setTimeout(setShowPerformanceModal(true));
        break;
      case "variables":
        setTimeout(setShowVariables(!showVariables));
        break;
    }

  };

  useEffect(() => {
    setExpanded(false);
    setSubmenuVisible(false);
    props.close(false);
  }, [props.disabled]);


  const toggleCompact = (val) => {
    if (!props.disabled) {
      setExpanded(val);
      if (!val) {
        setSubmenuVisible(false);
        props.close(false);
      }
    }
  }

  const handleIncrementTicker = useCallback((id) => {
    setNavCountTickers(old => ({
      ...old,
      [id]: (old[id] || 0)+1
    }));
  }, [submenu]);

  const handleSetTicker = useCallback((id, val) => {
    setNavCountTickers(old => ({
      ...old,
      [id]: val
    }));
    if (id === "alert" && props.setDisableNext) {
      props.setDisableNext(val > 0);
    }
  }, [submenu]);

  useEffect(() => {
    if (submenuVisible && submenu == 'messaging') {
      setNavCountTickers(old => ({...old, messaging: 0}));
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
      icon: "chat",
      label: t("sidebar.messaging"),
      visible: props.game ? true : false,
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
      icon: "bell",
      id: "alert",
      label: t("sidebar.alerts"),
      visible: avisible,
      submenu: (
        <Alerts
          editpage={!props.game}
          refresh={props.refresh}
          globalVars={props.globalVars}
          localVars={props.localVars}
          handleLevel={props.handleLevel}
          socket={props.socket}
          level={props.level}
          handleDisable={props.handleDisable}
          setAlerts={props.setAlerts}
          alerts={props.alerts}
          page={props.page}
          setTicker={(val) => handleSetTicker("alert", val)}
          {...props.alertProps}
        />
      )
    },
    {
      icon: "users",
      id: "userlist",
      label: t("sidebar.users"),
      visible: props.game ? true : false,
      submenu: (
        <Players
          players={props.players}
        />
      )
    },
    {
      to: "/performance",
      icon: "graph",
      id: "performance",
      label: t("sidebar.performance"),
      visible: true,
    },
    {
      icon: "cog",
      id: "settings",
      label: t("sidebar.settings"),
      visible: svisible,
      submenu: (
        <Settings
        />
      )
    },
    {
      to: '/variables',
      icon: "control",
      id: "variables",
      label: t("sidebar.variables"),
      visible: props.game ? false : true
    },
    {
      icon: "notes",
      id: "notes",
      label: t("sidebar.notes"),
      visible: props.game ? true : false,
      submenu: (
        <Notes
          editpage={!props.game}
          setNotes={props.setNotes}
          editNotes={props.editNotes}
          delNotes={props.delNotes}
          notes = {props.notes}
          socket={props.socket}
        />
      )
    },
    {
      icon: "pallet",
      id: "themes",
      label: "Themes",
      visible: props.game ? false : true,
      submenu: (
        <Themes
          themes={props.themes}
          setThemes={props.setThemes}
          shapeThemes={props.shapeThemes}
          setShapeThemes={props.setShapeThemes}
        />
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
        <StyledNav compact={!expanded || submenuVisible} submenu={submenuVisible} {...props} title={''}>
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
        {expanded && !submenuVisible ? (
          <div>
            <Link to={{pathname: "/dashboard"}}>
              <Image className="game-logo-big" cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/v1652056889/images/06_eduSIM_vertical_tnvn9p.jpg"}   alt={t("alt.sim")}/>
            </Link>
          </div>

        ) : (
          <div>
            <Link to={{pathname: "/dashboard"}}>
              <Image className="game-logo" cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/v1652056889/images/06_eduSIM_vertical_tnvn9p.jpg"}   alt={t("alt.sim")} />
            </Link>
          </div>
        )}



        </StyledNav>
      </div>
      <Modal
        isOpen={showPerformanceModal}
        onRequestClose={() => setShowPerformanceModal(false)}
        className="performanceModal"
        overlayClassName="myoverlay"
        closeTimeoutMS={250}
        ariaHideApp={false}
      >
        <Performance
          userId={props.userId}
          status={props.gamepieceStatus}
          customObjs={props.customObjs}
          ref={performanceModal}
          gameMode={props.game}
          setData={props.performanceFunctions}
          variables={props.game ? props.globalVars : props.variables}
        />
      </Modal>
      {showVariables && (
        <div className="variable-containers">
        <Variables
          editpage={!props.game}
          cons={props.cons ? props.cons : []}
          ints={props.ints ? props.ints : []}
          trigs={props.trigs ? props.trigs : []}
          gameVars={props.variables ? props.variables : []}
          setVars={props.setVars}
          setCons={props.setCons}
          setTrigs={props.setTrigs}
          editVars={props.editVars}
          delVars={props.delVars}
          delCons={props.delCons}
          setInts={props.setInts}
          random={props.random}
          delInts={props.delInts}
          shapes={props.shapes}
          allShapes={props.allShapes}
          closePerformance={closePerformance}
          customObjects={props.customObjects}
          savedObjects={props.savedObjects}
          loadObjects={props.loadObjects}
          {...props}
        />
        </div>
      )}

    </>
  );
}
export default Sidebar;


  // {!props.game && (
  //   <Disabled disabled={props.disabled}>
  //     <Pencil
  //       id="4"
  //       psize="2"
  //       type="nav"
  //       title=""
  //       hidden={!expanded}
  //       submenu={submenuVisible}
  //       mvisible={handleMvisible}
  //       avisible={handleAvisible}
  //       pavisible={handlePavisible}
  //       svisible={handleSvisible}
  //       pevisible={handlePevisible}
  //     />
  //   </Disabled>
  // )}
