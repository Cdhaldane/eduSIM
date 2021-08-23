import React, { useState} from "react";
import styled from "styled-components"
import Pencil from "../Pencils/Pencil";
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



function NavLinksGroup(props) {



  const links = [
    {
        to: "/dashboard",
        img: props.img,
        label: props.title,

        visible: true,
        icon: null
    },
      {
          to: "/chat",
          icon:"fas fa-comment-dots",
          label:"Messaging",
          visible: props.mvisible
      },
      {
          to: "/alert",
          icon:"fas fa-bell",
          label:"Alert",
          visible: props.avisible
      },
      {
          to: "/parameters",
          icon:"fas fa-sliders-h",
          label:"Parameters",
          visible: props.pavisible
      },
      {
          to: "/settings",
          icon:"fas fa-cog",
          label:"Settings",
          visible: props.svisible

      },
      {
          to: "/performance",
          icon:"fas fa-chart-bar",
          label:"Performance",
          visible: props.pevisible
      },



  ];
    return (
      <LinksGroup {...props}>
        {links.map((link) => {
          return link.visible ?
          <DenseNavLinks
            compact={props.compact}
            key={link.to}
            to={link.to}
            iconClassName={link.icon}
            label={link.label}
          />
          :
          <h1></h1>
          })}
      </LinksGroup>
    );
  }

export default NavLinksGroup;
