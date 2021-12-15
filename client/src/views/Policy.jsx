import React from "react";
import { useTranslation } from "react-i18next";

function Policy(props){
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <h1>Privacy Policy</h1>
    </div>
  );
}

export default Policy;
