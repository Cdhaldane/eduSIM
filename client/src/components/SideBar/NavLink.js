import {NavLink as Link} from "react-router-dom"
import styled from "styled-components"
import React from "react"

const StyledLink = styled(Link)`
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 1.5rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  box-shadow: 0 -1px 0 0 rgba(255, 255, 255, 0.1);
  text-decoration: none;
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
    opacity: ${(p) => Number(!p.compact)};
    transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
  }
  &:hover {
    text-decoration: none ;
    background-color: rgba(255 255 255 / 5%);
  }
  &.active {
    color: #ff6358;
  }
  @media (max-width: 960px) {
    span {
      opacity: 1;
    }
  }
`;

function NavLink({children, iconClassName, label, ...rest}) {
  return (
    <StyledLink to="/chat" {...rest}>
      {children || (
        <>
          <i className={iconClassName}></i>
          <span className="label">{label}</span>
        </>
      )}
    </StyledLink>
  );
}

export default NavLink;
