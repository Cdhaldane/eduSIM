import React from "react";
import { Route, Switch, useLocation} from "react-router-dom";
import Navbar from "./components/Navbar";
import Loading from "./components/loading";
import Welcome from "./views/Welcome";
import Home from "./views/Home";
import Profile from "./views/Profile";
import Dashboard from "./views/Dashboard.jsx";
import GamePage from "./views/GamePage";
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./api/protected-route";
import Footer from "./components/Footer";
import Note from "./components/Note";





class App extends React.Component {

  render() {
    const { isLoading } = this.props.auth0;

    if (isLoading) {
      return <Loading />;
    }

    if (window.location.href != "http://localhost:3000/gamepage" ) {
      return (
      <div classname="default">
      <Navbar />
        <div >
          <div >
            <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/welcome" exact component={Welcome} />
            <Route path="/gamepage" exact component={GamePage} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
            </Switch>
            <div>
              <Footer />
            </div>
          </div>
        </div>
        </div>
      );
    } else {
      return(
      <div>
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/welcome" exact component={Welcome} />
            <Route path="/gamepage" exact component={GamePage} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
        </Switch>
      </div>

    );
    }
  }
}

export default withAuth0(App);
