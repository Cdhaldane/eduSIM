import React from "react";
import styled from "styled-components"
import NavLink from "./NavLink"

const LinksGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 0 14px 0;
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

const links = [
    {
        to: "/chat",
        icon:"fas fa-comment-dots",
        label:"Messaging"
    },
    {
        to: "/alert",
        icon:"fas fa-bell",
        label:"Alert"
    }

];

function NavLinksGroup(props) {
    return (
      <LinksGroup {...props}>
        {links.map((link) => (
          <DenseNavLinks
            compact={props.compact}
            key={link.to}
            to={link.to}
            iconClassName={link.icon}
            label={link.label}
          />
        ))}
      </LinksGroup>
    );
  }

export default NavLinksGroup;