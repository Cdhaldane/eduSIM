import React from "react";
import "./Buttons.css";

// keep same style as Button, but use a element instead

const STYLES =[
    "btn--primary--solid",
    "btn--warning--solid",
    "btn--danger--solid",
    "btn--success--solid",
    "btn--primary--outline",
    "btn--warning--outline",
    "btn--danger--outline",
    "btn--success--outline"
  ]
const SIZES =[
    "btn--medium",
    "btn--large"
]
function Button({
    children,
    type,
    href,
    buttonStyle,
    buttonSize
}) {
    const checkButtonStyle = STYLES.includes(buttonStyle) ? buttonStyle : STYLES[0] ;
    const checkButtonSize = SIZES.includes(buttonSize) ? buttonSize : SIZES[0] ;
    return (
        <a className={`btn ${checkButtonStyle} ${checkButtonSize}`} href={href}>
            {children}
        </a>
    );
}

export default Button;
