import React from "react";
import { useTranslation } from "react-i18next";

function Terms(props){
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <h1>Terms of Service</h1>
    </div>
  );
}

export default Terms;
