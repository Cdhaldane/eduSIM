
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
`;

function Players({ players }) {

  return (
    <Container>
      <h2>Players</h2>
      <hr/>
      <div>
        {Object.values(players || {}).map(({name, role}) => (
          <p>{name} ({role})</p>
        ))}
      </div>
    </Container>
  );
}

export default Players;
