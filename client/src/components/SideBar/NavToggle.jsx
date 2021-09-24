import React from "react"
import styled from "styled-components";

const Button = styled.button`
    background-color: transparent;
    border: none;
    min-height: 42px;
    color: rgba(255,255,255, .7);
    cursor: pointer;
    padding: 0 32px;
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
      color: white;
      font-size: 1.5em;
      background-color: #8f001a;
      border-radius: 0 999px 999px 0;
      display: flex;
      align-items: center;
      height: 100px;
      width: 60px;
      justify-content: flex-end;
    }
`;

function NavToggle(props) {
  return (
    <Button
      {...props}
      className="nav-toggle"
      onClick={() => props.setCompact(Number(props.compact))}
    >
      <i className="fas fa-chevron-left"></i>
    </Button>
  );
}

export default NavToggle;
