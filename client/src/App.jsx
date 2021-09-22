import React from "react";
import { Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Loading from "./components/Loading/Loading";
import Welcome from "./views/Welcome";
import Home from "./views/Home";
import About from "./views/About";
import Profile from "./views/Profile";
import Dashboard from "./views/Dashboard";
// import GamePage from "./views/GamePage";
import GamePageTest from "./views/GamePageTest"; // TEMPORARY CHANGE
import EditPage from "./views/EditPage";
import Join from "./views/Join"
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/Auth0/protected-route";

class App extends React.Component {

  render() {
    const { isLoading } = this.props.auth0;

    if (isLoading) {
      return <Loading />;
    }

    if (window.location.pathname === "/gamepage" || (window.location.pathname === "/editpage")) {
      return (
        <div>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/welcome" exact component={Welcome} />
            <Route path="/about" exact component={About} />
            <Route path="/gamepage/:roomid" component={GamePageTest} />
            <Route path="/editpage" exact component={EditPage} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            <ProtectedRoute path="/join" component={Join} />
          </Switch>
        </div>
      );
    } else {
      return (
        <div>
          <Navbar />
          <div >
            <div >
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="../components/Navbar" exact component={Navbar} />
                <Route path="/welcome" exact component={Welcome} />
                <Route path="/about" exact component={About} />
                <Route path="/gamepage/:roomid" component={GamePageTest} />
                <Route path="/editpage" exact component={EditPage} />
                <ProtectedRoute path="/profile" component={Profile} />
                <ProtectedRoute path="/dashboard" component={Dashboard} />
                <ProtectedRoute path="/join" component={Join} />
              </Switch>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default withAuth0(App);
