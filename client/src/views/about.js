import React from "react";
import { useAuth0 } from '@auth0/auth0-react';


function About(props){
  const { loginWithRedirect } = useAuth0();
    return (
      <div className="welcome">
        <h1>About!</h1>
        
      </div>
    );
}

export default About;

/*<HomeContent />*/
//<input type="submit" class="textbox" /
