import React from "react";
import { Route, Switch} from "react-router-dom";
import Navbar from "./components/Navbar";

import Loading from "./components/loading";
import ExternalApi from "./views/external-api";
import Home from "./views/home";
import Profile from "./views/profile";
import Dashboard from "./views/dashboard";

import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./api/protected-route";

import Footer from "./components/Footer";
import Note from "./components/Note";



import "./styles.css";

class App extends React.Component {
  render() {
    const { isLoading } = this.props.auth0;

    if (isLoading) {
      return <Loading />;
    }

    return (
    <div id="app" className="d-flex flex-column h-100">
    <Navbar />
      <div className="container flex-grow-1">
        <div className="mt-5">
          <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/dashboard" exact component={Dashboard} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/external-api" component={ExternalApi} />
          </Switch>
        </div>
      </div>
      <Footer />
      </div>

    );
  }
}

export default withAuth0(App);
