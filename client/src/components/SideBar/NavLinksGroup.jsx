import React, { forwardRef } from "react";
import styled from "styled-components"
import NavLink from "./NavLink"

const LinksGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 0 14px 0;
  margin-top: ${props => props.isPlayMode ? 0 : 50}px;
  margin-right: 2px;
  overflow: hidden;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 4px;
  }
  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
  }
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const DenseNavLinks = styled(NavLink)`
  && {
    box-shadow: none;
  }
`;

const NavLinksGroup = forwardRef((props, ref) => {
  return (
    <LinksGroup isPlayMode={props.isPlayMode}>
      {props.links.map((link, index) => {
        return link.visible &&
          <DenseNavLinks
            ref={link.id === "performance" ? ref : null}
            compact={props.compact}
            key={index}
            //to={link.to}
            disabled={props.disabled}
            iconClassName={link.icon}
            label={link.label}
            sublabel={link.sublabel}
            img={link.img}
            action={(e) => props.action(link.id, e)}
          />
      })}
    </LinksGroup>
  );
});

export default NavLinksGroup;
