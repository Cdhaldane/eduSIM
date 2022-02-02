
import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
`;

const Player = styled.div`   
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  padding: 6px;
  border-radius: 6px;
  ${p => p.me && 'background-color: #a4db7f59;'}
  & > p { 
    width: 34px;
    height: 34px;
    background-color: hsl(${p => p.hue || 0}, 66%, 40%);
    color: white;
    font-size: 1.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    margin-right: 10px;
  }
  & > div > b {
    font-size: .9em;
  }
  & > div > b > span {
    color: #3e7d14;
  }
  & > div > p {
    font-size: .8em;
  }
`;

const Players = ({ players }) => {
  const { t } = useTranslation();

  const userDBID = JSON.parse(localStorage.userInfo || '{}')?.dbid;

  return (
    <Container>
      <h2>{t("sidebar.users")}</h2>
      <hr/>
      <div>
        {Object.values(players || {}).map(({dbid, name, role}) => (
          <Player hue={parseInt(dbid, 16) % 360} me={userDBID === dbid} key={dbid}>
            <p>{name[0]}</p>
            <div>
              <b>{name} {userDBID === dbid && <span>({t("sidebar.you")})</span>}</b>
              <p>{role}</p>
            </div>
          </Player>
        ))}
      </div>
    </Container>
  );
}

export default Players;
