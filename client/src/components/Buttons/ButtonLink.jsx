import React from "react";
import "./Buttons.css";

// keep same style as Button, but use an element instead

const STYLES = [
    "btn--primary--solid",
    "btn--warning--solid",
    "btn--danger--solid",
    "btn--success--solid",
    "btn--primary--outline",
    "btn--warning--outline",
    "btn--danger--outline",
    "btn--success--outline"
];

const SIZES = [
    "btn--medium",
    "btn--large"
];

const Button = ({
    children,
    type,
    href,
    buttonStyle,
    buttonSize,
    className
}) => {
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0];
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0];
    return (
      <a className={`btn ${checkButtonStyle} ${checkButtonSize} ${className}`} href={href}>
         {children}
     </a>
    );
}

export default Button;
