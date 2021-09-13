import React from "react";
import Note from "../components/Note/Note";

function Home(props){
    return (
      <div className="welcome-container">
        <h1 class="welcome">Welcome!</h1>
        <div class="welcome-nav">
          <Note
            title="Are you a Student / Participant?"
            url="/welcome"
            img="student.png"
            class="welcome-navbutton"
          />
          <Note
            title="Are you a Teacher / Facilitator?"
            url="/dashboard"
            img="teacher.png"
            class="welcome-navbutton"
          />
        </div>
      </div>
    );
}

export default Home;
