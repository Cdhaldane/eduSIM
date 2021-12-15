import React from "react";
import { withAuth0 } from "@auth0/auth0-react";

class Profile extends React.Component {
  render() {
    const { user } = this.props.auth0;
    const { name, picture, email } = user;

    return (
      <div className="page-layout">
        <div className="profilepic">
          <img
            src={picture}
            alt="Profile"
            className="profilepic"
          />
        </div>
        <div className="profilename">
          <h1>{name}</h1>
          <h3 className="lead text-muted">{email}</h3>
        </div>
      </div>
    );
  }
}

export default withAuth0(Profile);
