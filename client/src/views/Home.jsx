import React from "react";
import Note from "../components/Note/Note";

function Home(props) {
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
          url="/dashboard"
          img="teacher.png"
          className="welcome-navbutton"
        />
      </div>
    </div>
  );
}

export default Home;
