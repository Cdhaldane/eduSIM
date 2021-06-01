import React, { useState } from "react";

function CreateArea(props) {
  const [note, setNote,] = useState(0);

  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value,
      };
    });
  }

  function submitNote(event) {
    props.onAdd(note);
    setNote({
      title: "",
      img: ""
    });
    event.preventDefault();
  }

  function onChange(event){
    const { name, value } = event.target;
    if (event.target.files && event.target.files[0]) {
      setNote({
      img: URL.createObjectURL(event.target.files[0])
    });
    }
  }

  return (
      <div className="area">

      <form >
        <p>
        Set up a simulation by entering a name and either selecting a display image
        from the ones listed or choose your own!
        </p>
        <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Simulation Name"
        />
      <input
          type="file"
          name="img"
          id="file"
          onChange={onChange}
          />
        <label for="file">Choose an image</label>
      <h3>
        Press off to exit.
      </h3>
        <button onClick={submitNote}>Add</button>
      </form>
    </div>

);
}

export default CreateArea;
