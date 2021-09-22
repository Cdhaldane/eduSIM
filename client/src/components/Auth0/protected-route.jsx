import React from "react";
import { Route } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../Loading/Loading";

const ProtectedRoute = (props) => {
  return (
    <Route
      component={withAuthenticationRequired(props.render, {
        onRedirecting: () => <Loading />,
      })}
    />
  );
}

export default ProtectedRoute;
