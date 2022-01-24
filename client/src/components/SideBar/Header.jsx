import React from "react";
import styled from "styled-components";

const Grid = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  height: 48px;
  align-items: stretch;
  padding: 0 24px;
  > div {
    display: flex;
    align-items: center;
  }
  button {
    white-space: nowrap;
  }
    .toggle-button{
        display: none;
        @media (max-width: 960px){
            display:inline;
            font-size: 25px;
        }
    }
`;

const Header = ({ toggle }) => {
  return (
    <Grid>
      <div onClick={toggle}>
        <i className="fas fa-bars toggle-button" />
      </div>
    </Grid>
  );
}

export default Header;
