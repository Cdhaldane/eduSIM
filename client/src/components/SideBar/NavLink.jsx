import { NavLink as Link } from "react-router-dom"
import styled from "styled-components"
import React, { forwardRef } from "react"
import { Image } from "cloudinary-react";

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
    min-height: 22px;
    min-width: 22px;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .countIndicator {
    position: absolute;
    background-color: rgb(34 125 204);
    color: var(--primary);
    font-size: .7em;
    padding: 2px 6px;
    border-radius: 12px;
    top: 16p;
    margin-top: 20px;
    margin-left: 12px;
  }
  .special{
    padding-left: 0px;
  }
  span {
    padding-left: 14px;
    line-height: 19px;
    white-space: nowrap;
    opacity: ${(p) => p.textopacity};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  p {
    padding-left: 4px;
    font-size: .7em;
    line-height: .9em;
    opacity: ${(p) => p.textopacity};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
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
  }
  ${(p) => !p.disabled && `
    &:hover {
      text-decoration: none;
      background-color: var(--primary);
      color: var(--white);
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

  return (
    <StyledLink
      ref={ref}
      href={!props.disabled && props.to ? "#" : undefined}
      onClick={props.action}
      disabled={props.disabled}
      textopacity={props.compact ? 0 : 1}
    >
      {props.children || (
        <>
          {props.iconClassName !== null ? (
            <>
              <i className={props.iconClassName} ></i>
              {props.count>0 && <div className="countIndicator">{props.count}</div>}
              <span className="label">{props.label}</span>
            </>
          ) : (
            <>
              <Image cloudName="uottawaedusim" publicId={"https://res.cloudinary.com/uottawaedusim/image/upload/" + localStorage.simimg + ".jpg"} alt="backdrop" />
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
