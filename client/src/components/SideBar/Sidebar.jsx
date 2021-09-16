import React, { useState } from "react";
import styled from "styled-components";
import Backdrop from "../../ui/Backdrop"
import NavLinksGroup from "./NavLinksGroup"
import NavToggle from "./NavToggle"
import Pencil from "../Pencils/Pencil";

const StyledNav = styled.nav`
  background-color: #8f001a;
  width: ${(p) => (p.compact ? "70px" : "256px")};
  height: 100vh;
  position: absolute;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition-property: width, transform, left !important;
  transition-duration: 0.3s !important;
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1) !important;
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
    transition: left 0.3s
      ${(p) => p.visible ? "cubic-bezier(0.4, 0, 1, 1)" : "cubic-bezier(0, 0, 0.2, 1)"} !important;
    left: ${(p) => (p.compact ? "-256px" : "0")};
  }
`;

function Sidebar(props) {
  const [compact, setCompact] = useState(0);

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

  return (
    <>
      <Backdrop visible={props.visible} onClick={props.close} />
      <StyledNav compact={!compact} {...props}>
        <NavLinksGroup compact={!compact}
          mvisible={mvisible}
          avisible={avisible}
          pavisible={pavisible}
          svisible={svisible}
          pevisible={pevisible}
          img={props.img}
          title={props.title}
        />

        {/* <NavLink
          compact={compact}
          to="/"
          iconClassName="far fa-copyright"
          label="Copyright 2021"
          />  */}
        <NavToggle compact={!compact} setCompact={setCompact} />
        
        <Pencil
          id="4"
          psize="2"
          type="nav"
          title=""
          hidden={!compact}
          mvisible={handleMvisible}
          avisible={handleAvisible}
          pavisible={handlePavisible}
          svisible={handleSvisible}
          pevisible={handlePevisible}
        />
      </StyledNav>
    </>
  );
}
export default Sidebar;
