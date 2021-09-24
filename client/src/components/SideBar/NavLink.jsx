import { NavLink as Link } from "react-router-dom"
import styled from "styled-components"
import React from "react"
import { Image } from "cloudinary-react";

const StyledLink = styled.a`
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 1.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  text-decoration: none;
  cursor: pointer;
  i {
    min-height: 22px;
    min-width: 22px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  span {
    padding-left: 14px;
    line-height: 19px;
    white-space: nowrap;
    opacity: ${(p) => p.textopacity};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  p {
    padding-left: 14px;
    font-size: .7em;
    line-height: .9em;
    opacity: ${(p) => p.textopacity};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  &:hover {
    text-decoration: none ;
    background-color: rgba(255 255 255 / 5%);
  }
  &.active {

  }
  img{
    position: relative;
    margin-right: -15px;
    left: -10px;
    height: 40px;
    width: 40px;
    border-radius: 10px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @media screen and (orientation: portrait) {
      span, p {
        opacity: 1;
      }
  }
`;

function NavLink(props) {

  return (
    <StyledLink href={props.to} onClick={props.action} textopacity={props.compact ? 0 : 1}>
      {props.children || (
        <>
          {props.iconClassName !== null ? (
            <>
              <i className={props.iconClassName} ></i>
              <span className="label">{props.label}</span>
            </>
          ) : (
            <>
              <Image cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + props.img + ".jpg"} alt="backdrop" />
              <div>
                <span className="label">{props.label}</span>
                <p className="sublabel">{props.sublabel}</p>
              </div>
            </>
          )}
        </>
      )}

    </StyledLink>
  );
}

export default NavLink;
