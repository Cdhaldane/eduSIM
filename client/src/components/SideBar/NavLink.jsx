import { NavLink as Link } from "react-router-dom"
import styled from "styled-components"
import React, { forwardRef } from "react"
import { Image } from "cloudinary-react";
import { useTranslation, Trans } from "react-i18next";

import Chat from "../../../public/icons/chat-alt-7.svg"
import Bell from "../../../public/icons/bell-alt-1.svg"
import Users from "../../../public/icons/users-2.svg"
import Calendar from "../../../public/icons/calendar.svg"
import Graph from "../../../public/icons/graph-alt-4.svg"
import Cog from "../../../public/icons/cog.svg"
import Control from "../../../public/icons/control-panel.svg"
import Notes from "../../../public/icons/notepad.svg"

const StyledLink = styled.a`
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary);
  box-shadow: 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  text-decoration: none;
  ${(p) => !p.disabled && "cursor: pointer;"}
  ${(p) => p.disabled && "opacity: 0.5;"}
  i {
    margin-top: 0px;
    margin-right: 0px;
    height: 26px;
    width: 26px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .countIndicator {
    position: relative;
    margin-right: -28px;
    background-color: rgb(34 125 204);
    color: var(--primary);
    font-size: .7em;
    padding: 2px 6px;
    border-radius: 12px;
    left: -25px;
    top: 16p;
    margin-top: 20px;
    margin-left: 12px;
  }
  .special{
    width: 10px !important;
    padding-left: 0px;
    text-overflow: ellipsis !important;
  }
  span {
    padding-left: 14px;
    line-height: 19px;
    text-overflow: ellipsis !important;
    opacity: ${(p) => p.textopacity};
    display: ${(p) => p.textopacity === 0 ? 'none' : 'inline'};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  p {
    padding-left: 4px;
    font-size: .7em;
    line-height: .9em;
    opacity: ${(p) => p.textopacity};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
    text-overflow: ellipsis;
  }
  img{
    position: relative;
    left: -10px;
    margin-right: 0px;
    height: 40px;
    width: 40px;
    max-width: 40px;
    min-width: 40px;
    border-radius: 10px;
    font-size: 1.5rem;
    object-fit: cover;
  }
  ${(p) => !p.disabled && `
    &:hover {
      text-decoration: none;
      background-color: var(--primary);
      color: var(--white);
      i {
        fill: var(--white) !important;
      }
    }
  `}
  &.active {

  }
  @media screen and (orientation: portrait) {
      span, p {
        opacity: 1;
      }
  }
`;



const NavLink = forwardRef((props, ref) => {
  const { t } = useTranslation();

  const getIcon  = () => {
      switch (props.iconClassName){
        case "chat":
          return <Chat />
          break;
        case "bell":
          return <Bell />
          break;
        case "users":
          return <Users />
          break;
        case "graph":
          return <Graph />
          break;
        case "cog":
          return <Cog />
          break;
        case "control":
          return <Control />
          break;
        case "notes":
          return <Notes />
          break;
      }

  }

  return (
    <StyledLink
      ref={ref}
      href={!props.disabled && props.to ? "#" : undefined}
      onClick={props.action}
      disabled={props.disabled}
      textopacity={props.compact ? 0 : 1}
      title={props.label}

    >
      {props.children || (
        <>
          {props.iconClassName !== null ? (
            <>
              <i className="icon sidebar-icon">{getIcon()}</i>
              {props.count>0 && <div className="countIndicator">{props.count}</div>}
              <span className="label">{props.label}</span>
            </>
          ) : (
            <>
              <Image cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img + ".jpg"}  alt={t("alt.sim")} />
              <div>
                <span className="special">{props.label}</span>
                <p className="sublabel">{props.sublabel}</p>
              </div>
            </>
          )}
        </>
      )}

    </StyledLink>
  );
});

export default NavLink;
