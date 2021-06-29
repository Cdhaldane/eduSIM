import React from "react";
import { Route, Switch} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Loading from "./components/Loading/Loading";
import Welcome from "./views/welcome.js";
import Home from "./views/Home.js";
import Profile from "./views/profile.js";
import Dashboard from "./views/Dashboard";
import Homepage from "./views/Homepage";
import GamePage from "./views/GamePage";
import EditPage from "./views/EditPage";
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/Auth0/protected-route";
import Footer from "./components/Footer";

class App extends React.Component {

  render() {
    const { isLoading } = this.props.auth0;

    if (isLoading) {
      return <Loading />;
    }

    if (window.location.href == "http://localhost:3000/gamepage" || (window.location.href == "http://localhost:3000/EditPage")) {
      return (
        <div>
          <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/welcome" exact component={Welcome} />
              <Route path="/gamepage" exact component={GamePage} />
            <Route path="/homepage" exact component={Homepage} />
              <Route path="/editpage" exact component={EditPage} />
              <ProtectedRoute path="/profile" component={Profile} />
              <ProtectedRoute path="/dashboard" component={Dashboard} />
          </Switch>
        </div>
      );
    } else {
      return(
        <div>
        <Navbar />

          <div >
            <div >
              <Switch>
              <Route path="/" exact component={Home} />
              <Route path="../components/Navbar" exact component={Navbar} />
              <Route path="/welcome" exact component={Welcome} />
            <Route path="/homepage" exact component={Homepage} />
              <Route path="/gamepage" exact component={GamePage} />
              <Route path="/editpage" exact component={EditPage} />
              <ProtectedRoute path="/profile" component={Profile} />
              <ProtectedRoute path="/dashboard" component={Dashboard} />
              </Switch>
              <div>

              </div>
            </div>
          </div>
          </div>
        );
    }
  }
}

export default withAuth0(App);

  // <Footer />
