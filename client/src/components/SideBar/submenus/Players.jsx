
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
`;

const Player = styled.div`   
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  & > p { 
    width: 40px;
    height: 40px;
    background-color: hsl(${p => p.hue || 0}, 66%, 40%);
    color: white;
    font-size: 1.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    margin-right: 10px;
  }
  & > div > b {
    font-size: .9em;
  }
  & > div > p {
    font-size: .8em;
  }
`;

function Players({ players }) {

  return (
    <Container>
      <h2>Players</h2>
      <hr/>
      <div>
        {Object.values(players || {}).map(({dbid, name, role}) => (
          <Player hue={parseInt(dbid, 16) % 360}>
            <p>{name[0]}</p>
            <div>
              <b>{name}</b>
              <p>{role}</p>
            </div>
          </Player>
        ))}
      </div>
    </Container>
  );
}

export default Players;
