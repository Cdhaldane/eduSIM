import React from "react";
import { Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Loading from "./components/Loading/Loading";
import Welcome from "./views/Welcome";
import Home from "./views/Home";
import About from "./views/About";
import Profile from "./views/Profile";
import Dashboard from "./views/Dashboard";
import GamePage from "./views/GamePage";
import EditPage from "./views/EditPage";
import Join from "./views/Join"
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/Auth0/protected-route";
import AlertPopup from "./components/Alerts/AlertPopup";
import AlertContextProvider from "./components/Alerts/AlertContext";

const App = (props) => {

  const { isLoading } = props.auth0;

  if (isLoading) return <Loading />;

  return (
    <AlertContextProvider>
      <AlertPopup/>
      {!(window.location.pathname === "/gamepage" || window.location.pathname === "/editpage") && (
        <Navbar />
      )}
      <div >
        <Switch>
          <Route exact path="/" >
            <Home />
          </Route>
          {!(window.location.pathname === "/gamepage" || window.location.pathname === "/editpage") && (
            <Route exact path="../components/Navbar" render={(props) => <Navbar {...props} />} />
          )}
          <Route exact path="/welcome" render={(props) => <Welcome {...props} />} />
          <Route exact path="/about" render={(props) => <About {...props} />} />
          <Route exact path="/gamepage" render={(props) => <GamePage {...props} />} />
          <Route exact path="/editpage" render={(props) => <EditPage {...props} />} />
          <ProtectedRoute path="/profile" render={(props) => <Profile {...props} />} />
          <ProtectedRoute path="/dashboard" render={(props) => <Dashboard {...props} />} />
          <ProtectedRoute path="/join" render={(props) => <Join {...props} />} />
        </Switch>
      </div>
    </AlertContextProvider>
  );
}

export default withAuth0(App);
