import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Container = styled.div`
position: absolute;
bottom: 0px;
  z-index: -1;
  width: 100%;
  height: auto;
  width: 100%;
  background-color: var(--primary);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  margin-top: 0px;
  font-size: 0.9em;
  & p {
    display: flex;
    align-items: center;
  }
  & a {
    color: white;
    text-decoration: underline;
  }
  & i {
    font-size: 0.5em;
    margin: 0 10px;
  }
`;

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  return (
    <Container>
      <p>
        <Link to="/terms">{t("navbar.termsOfService")}</Link>
        <i className="fas fa-circle"></i>
        <Link to="/privacy">{t("navbar.privacyPolicy")}</Link>
        <i className="fas fa-circle"></i>
        <a href="mailto:edusimuottawa@outlook.ca">{t("navbar.contact")}</a>
      </p>
      {t("navbar.copyright", { year: currentYear })}
    </Container>
  );
}

export default Footer;
