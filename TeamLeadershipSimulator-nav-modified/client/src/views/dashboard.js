import React from "react";
import { withAuth0 } from "@auth0/auth0-react";
import DashboardItems from "./DashboardItems"
import Note from "../components/Note";
import simulationitems from "./simulationitems"


function createNote(term){
  return (<Note
    key={term.id}
    title={term.title}
    url={term.url}
    img={term.img}
    class={term.class}
    backimg={term.backimg}
  />
);
}

function Dashboard(props){
    return (
      <div className="dashboard">
        <h1>Home</h1>
        <hr />
        <h2>New simulation</h2>
        {DashboardItems.map(createNote)}
        <hr id="under_menu_line" />
        <h2>My simulations 🗑️</h2>
        {simulationitems.map(createNote)}

      </div>
    );
  }

export default withAuth0(Dashboard);

/*<HomeContent />*/
