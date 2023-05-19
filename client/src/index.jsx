import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "./components/Auth0/auth0-provider-with-history";
import "./i18n.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Auth0ProviderWithHistory>
        <App />
    </Auth0ProviderWithHistory>
  </Router>,
);
