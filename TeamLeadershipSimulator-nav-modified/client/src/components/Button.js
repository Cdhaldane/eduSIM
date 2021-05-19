import React from "react";
import "./Button.css"
import { withAuth0 } from "@auth0/auth0-react";

const STYLES =[
  "btn--primary",
  "btn--outline"
]

const SIZES =[
  "btn--medium",
  "btn--large"
]

class Button extends React.Component {
  render() {
    const { loginWithRedirect } = this.props.auth0;

    return (
      <button
        className="btn"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </button>
    );
  }
}

export default withAuth0(Button);
