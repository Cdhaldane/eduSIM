import React, { Fragment } from "react";


import Note from "../components/Note";




function Home(props){
    return (
      <div className="welcome">
        <h1>Welcome!</h1>
        <p>Already have a room code?</p>
        <p><form action = {"http://localhost:3000/" + document.getElementById.value}><label>Join!<input type="text" class="textbox" placeholder="Room Code" id="code" /></label></form></p>
      </div>
    );
}

export default Home;

/*<HomeContent />*/
//<input type="submit" class="textbox" /
