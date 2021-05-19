import React from "react";
import { withAuth0 } from "@auth0/auth0-react";
import DashboardItems from "./DashboardItems"


import Note from "../components/Note";

import "../styles.css";

function createNote(term){
  return (<Note
    key={term.id}
    title={term.title}
  />
);
}

function Dashboard(props){
    return (
      <div>
        {DashboardItems.map(createNote)}
      </div>
    );
  }

export default withAuth0(Dashboard);

/*<HomeContent />*/
