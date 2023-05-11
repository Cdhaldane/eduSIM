import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import Auth0ProviderWithHistory from "./components/Auth0/auth0-provider-with-history";
import "./i18n.js";

import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
  <Router>
    <Auth0ProviderWithHistory>
        <App />
    </Auth0ProviderWithHistory>
  </Router>
);
