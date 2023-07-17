import React from "react";
import "./Tooltip.css";

export const Tooltip = ({ children, tooltipText, direction }) => (
    <div className="tooltip-container">
      {children}
      <span className={"tooltip-text " + direction}>{tooltipText}</span>
    </div>
  );