import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Note from "../components/Note/Note";

function Home(props) {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="welcome-container">
      <h1 className="welcome">Welcome!</h1>
      <div className="welcome-nav">
        <Note
          title="Are you a Student / Participant?"
          url="/welcome"
          img="student.png"
          className="welcome-navbutton"
        />
        <Note
          title="Are you a Teacher / Facilitator?"
          onClick={() => loginWithRedirect({ redirectUri: window.location.origin + "/dashboard", prompt: "select_account" })}
          img="teacher.png"
          className="welcome-navbutton"
        />
      </div>
    </div>
  );
}

export default Home;
