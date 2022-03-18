import React from "react"
import styled from "styled-components";

const Button = styled.button`
    background-color: transparent;
    border: none;
    min-height: 42px;
    margin-bottom: 100px;
    color: var(--primary);
    ${(p) => !p.disabled && "cursor: pointer;"}
    ${(p) => p.disabled && "opacity: 0.5;"}
    padding: 0 30px;
    box-shadow: 0 -1px 0 0 rgba(255 255 255 / 10%);
    text-align: right;
    i {
        transition: transform 0.2s linear;
        transform: rotate(${p => p.compact ? "180deg" : "0deg"});
    }
    @media screen and (orientation: portrait) {
      transition: left 0.3s cubic-bezier(0, 0, 0.2, 1) !important;
      position: fixed;
      left: ${p => p.compact ? '0px' : (p.submenu ? '350px' : '256px')};
      top: calc(50% - 50px);
      color: var(--primary);
      font-size: 1.5em;
      padding: 0 10px;
      background-color: var(--white);
      border: 1px solid var(--primary);
      border-left: none;
      border-radius: 0 999px 999px 0;
      z-index: -1;
      display: flex;
      align-items: center;
      height: 70px;
      width: 50px;
      justify-content: center;
      ${(p) => p.disabled && "opacity: 0;"}
      i{

      }
    }
`;

const NavToggle = (props) => {
  return (
    <Button
      {...props}
      className="nav-toggle"
      onClick={() => props.setExpanded(props.compact)}
    >
      <i className="fas fa-chevron-left"></i>
    </Button>
  );
}

export default NavToggle;
