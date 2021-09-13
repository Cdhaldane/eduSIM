import React from "react";
import { useAuth0 } from '@auth0/auth0-react';

function Welcome(props){
  const { loginWithRedirect } = useAuth0();
    return (
      <div className="welcome">
        <h1>Welcome!</h1>
        <p>Already have a room code?</p>
        <p><form action = {window.location.origin + "/" + document.getElementById.value}><label>Join!<input type="text" class="textbox" placeholder="Room Code" id="code" /></label></form></p>
      <p>If not, get one from your teacher / facilitator, <br/> or <button id="link" onClick={() => loginWithRedirect({redirectUri: window.location.origin+"/dashboard",})}> setup / create your own simulation</button></p>
      </div>
    );
}

export default Welcome;