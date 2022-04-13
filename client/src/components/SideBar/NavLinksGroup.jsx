import React, { forwardRef } from "react";
import styled from "styled-components"
import NavLink from "./NavLink"

const LinksGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px -10px 14px 0;
  margin-top: 30vh;
  margin-right: 2px;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-color: var(--primary) white;
  scrollbar-width: thin;
  ::-webkit-scrollbar {
    width: 4px;
  }
  /* Track */
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    background-color: #F5F5F5;
  }
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background-color: var(--primary);
  	background-image: -webkit-linear-gradient(45deg,
  	                                          rgba(255, 255, 255, .2) 25%,
  											  transparent 25%,
  											  transparent 50%,
  											  rgba(255, 255, 255, .2) 50%,
  											  rgba(255, 255, 255, .2) 75%,
  											  transparent 75%,
  											  transparent)
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
            count={props.counts[link.id] || 0}
          />
      })}
    </LinksGroup>
  );
});

export default NavLinksGroup;
