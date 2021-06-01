import React from "react";
import { withAuth0 } from "@auth0/auth0-react";

class Profile extends React.Component {
  render() {
    const { user } = this.props.auth0;
    const { name, picture, email } = user;

    return (
      <div>
        <div className="row align-items-center profile-header">
          <div className="profilepic">
            <img
              src={picture}
              alt="Profile"
              className="profilepic"
            />
          </div>
          <div className="profilename">
            <h2>{name}</h2>
            <p className="lead text-muted">{email}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default withAuth0(Profile);
