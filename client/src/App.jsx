import React, { Suspense, createContext, useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Loading from "./components/Loading/Loading";
import Navbar from "./components/Navbar/Navbar";
import { withAuth0 } from "@auth0/auth0-react";
import ProtectedRoute from "./components/Auth0/protected-route";
import AlertPopup from "./components/Alerts/AlertPopup";
import AlertContextProvider from "./components/Alerts/AlertContext";
import "./components/CreateCsv/CreateCsv.css";
import "./components/CreateArea/CreateArea.css";

const Welcome = React.lazy(() => import("./views/Welcome"));
const Home = React.lazy(() => import("./views/Home"));
const About = React.lazy(() => import("./views/About"));
const Profile = React.lazy(() => import("./views/Profile"));
const CollabLogin = React.lazy(() => import("./views/CollabLogin"));
const Dashboard = React.lazy(() => import("./views/Dashboard"));
const CanvasPage = React.lazy(() => import("./views/CanvasPage"));
const Join = React.lazy(() => import("./views/Join"));

export const SettingsContext = createContext({
  settings: {}
});

const customObjects = [
  "polls",
  "connect4s",
  "tics",
  "htmlFrames",
  "inputs",
  "timers"
];

const App = (props) => {

  const [localSettings, setLocalSettings] = useState(JSON.parse(localStorage.userSettings || '{}'));

  const updateSetting = (key, val) => {
    const obj = JSON.parse(localStorage.userSettings || '{}');
    localStorage.setItem('userSettings', JSON.stringify({
      ...obj,
      [key]: val
    }));
    setLocalSettings({
      ...obj,
      [key]: val
    });
  }

  useEffect(() => {
    document.documentElement.style.filter = (
      localSettings.contrast ? 'saturate(1.25) grayscale(.1) contrast(1.2)' : ''
    );
    document.documentElement.style.fontSize = (localSettings.textsize || 1) + 'em';
    document.documentElement.className = localSettings.notransition ? 'notransition' : '';
  }, [localSettings]);

  const { isLoading } = props.auth0;
  if (isLoading) return <Loading />;

  return (
    <SettingsContext.Provider value={{ updateSetting, settings: localSettings || {} }}>
      <AlertContextProvider>
        <AlertPopup />
        {!(window.location.pathname.startsWith("/gamepage") || window.location.pathname === "/editpage") && (
          <Navbar />
        )}
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route exact path="/" >
              <Home />
            </Route>
            {!(window.location.pathname.startsWith("/gamepage") || window.location.pathname === "/editpage") && (
              <Route exact path="../components/Navbar" render={(props) => <Navbar {...props} />} />
            )}
            <Route exact path="/welcome" render={(props) => <Welcome {...props} />} />
            <Route exact path="/about" render={(props) => <About {...props} />} />
            <Route exact path="/gamepage/:roomid" render={(props) => <CanvasPage {...props} customObjects={customObjects} />} />
            <Route exact path="/editpage" render={(props) => <CanvasPage edit {...props} customObjects={customObjects} />} />
            <Route exact path="/collab-invite" render={(props) => <CollabLogin {...props} />} />
            <ProtectedRoute path="/profile" render={(props) => <Profile {...props} />} />
            <ProtectedRoute path="/dashboard" render={(props) => <Dashboard {...props} />} />
            <ProtectedRoute path="/join" render={(props) =>
              <Join
                customObjects={customObjects}
                {...props}
              />}
            />
          </Switch>
        </Suspense>
      </AlertContextProvider>
    </SettingsContext.Provider>
  );
}

export default withAuth0(App);
