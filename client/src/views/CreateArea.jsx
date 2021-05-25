import React, { useState } from "react";

function CreateArea(props) {
  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  function submitNote(event) {
    props.onAdd(note);
    setNote({
      title: "",
      content: ""
    });
    event.preventDefault();
  }

  return (
    <div className="area">
      <form >
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Simulation Name"
        />
      <input
            type="file"
            name="file"
            id="file"
            onChange={handleChange}
            value=""
          />
        <label for="file">Choose an image</label>
        <button onClick={submitNote}>Add</button>
      </form>
    </div>
  );
}

export default CreateArea;
