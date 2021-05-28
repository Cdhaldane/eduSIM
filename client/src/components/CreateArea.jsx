import React, { useState } from "react";

function CreateArea(props) {
  const [note, setNote,] = useState(0);

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
      content: "",
    });
    event.preventDefault();
  }

  function onChange(event){
    if (event.target.files && event.target.files[0]) {
      setNote({
      img: URL.createObjectURL(event.target.files[0])
    });
    }
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
          name="img"
          id="file"
          onChange={onChange}
          />
        <label for="file">Choose an image</label>
        <button onClick={submitNote}>Add</button>
      </form>
    </div>

);
}

export default CreateArea;
