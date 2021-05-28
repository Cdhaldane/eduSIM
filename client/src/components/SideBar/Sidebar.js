import React, { useState } from "react";
import styled from "styled-components";
import Backdrop from "../../ui/Backdrop"
import NavLink from "./NavLink"
import NavLinksGroup from "./NavLinksGroup"
import NavToggle from "./NavToggle"

const StyledNav = styled.nav`
  background-color: #8f001a;
  width: ${(p) => (p.compact ? "70px" : "256px")};
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition-property: width, transform !important;
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
  @media (max-width: 960px) {
    position: fixed;
    width: 256px;
    transform: translate3d(
      ${(p) =>
        p.visible ? 0 : "-260px"},
      0,
      0
    );
    transition: transform 0.3s
      ${(p) => p.visible ? "cubic-bezier(0.4, 0, 1, 1)" : "cubic-bezier(0, 0, 0.2, 1)"} !important;
  }
`;

function Sidebar (props) {
  const [compact, setCompact] = useState(0);
    return (
      <>
        <Backdrop visible={props.visible} onClick={props.close}/>
        <StyledNav compact={compact} {...props}>
          <NavLinksGroup compact={compact} />
          {/* <NavLink
          compact={compact}
          to="/"
          iconClassName="far fa-copyright"
          label="Copyright 2021"
          />  */}
          <NavToggle compact={compact} setCompact={setCompact} />
        </StyledNav>
      </>
    );
}
export default Sidebar;
