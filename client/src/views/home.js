import React, { Fragment } from "react";


import Note from "../components/Note";




function Home(props){
    return (
      <div>
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

/*<HomeContent />*/
//<input type="submit" class="textbox" /
