import React from "react";
import Note from "../components/Note/Note";

function Home(props){
    return (
      <div class="body">
        <h1 class="welcome">Welcome!</h1>
        <Note
          title="Are you a Student / Participant?"
          url="/welcome"
          img="student.png"
          class="welcomep1"
        />
        <Note
          title="Are you a Teacher / Facillitator?"
          url="/dashboard"
          img="teacher.png"
          class="welcomep1"
        />
      </div>
    );
}

export default Home;
