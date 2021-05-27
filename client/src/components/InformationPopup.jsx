import React, { useState } from "react";

function Info() {
  const[open, setOpen] = useState(0);
  return(
  <div className={"ibut" + open}>
  {(open != 1)
    ? <button onClick={() => setOpen(1)}><i class="fas fa-caret-square-up fa-3x"></i></button>
    : <button onClick={() => setOpen(0)}><i class="fas fa-caret-square-down fa-3x"></i></button>
}
<div className={"info" + open}>
    <h1>My personal information:</h1>
    <b>
     Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eros tortor,
     finibus eget porttitor vitae, gravida at ante. Quisque ultrices erat et ante
     rutrum sagittis sit amet at risus. Quisque blandit urna ut nunc rutrum, sit
     amet finibus mi sagittis. Cras accumsan sapien mi, at aliquam sapien consectetur
     vitae. Nullam euismod magna justo. Suspendisse in augue at eros placerat laoreet.
     Duis at sapien dui. Pellentesque quis facilisis erat. Donec id dictum dui. Proin
     nisi nisl, suscipit eu accumsan ut, tincidunt eget tellus. Sed iaculis lacinia mi,
     quis interdum enim condimentum et. Etiam euismod iaculis tortor et tempor. Integer
     faucibus imperdiet velit et vulputate. Cras euismod risus eget molestie hendrerit.
    </b>
  </div>
</div>
  )
}

export default Info;
