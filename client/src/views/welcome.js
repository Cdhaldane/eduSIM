import React from "react";
import { useAuth0 } from '@auth0/auth0-react';


function Welcome(props){
  const { loginWithRedirect } = useAuth0();
    return (
      <div className="welcome">
        <h1>Welcome!</h1>
        <p>Already have a room code?</p>
        <p><form action = {"http://localhost:3000/" + document.getElementById.value}><label>Join!<input type="text" class="textbox" placeholder="Room Code" id="code" /></label></form></p>
        <p>If not, get one from your teacher / facilitator, <br/> or <a href="#" onClick={() => loginWithRedirect({redirectUri: "http://localhost:3000/dashboard",})}> setup / create your own simulation</a></p>
      </div>
    );
}

export default Welcome;

/*<HomeContent />*/
//<input type="submit" class="textbox" /
