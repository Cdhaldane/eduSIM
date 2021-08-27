import React, { useState } from "react";
import Switch from "react-switch"
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./CreateArea.css";
import Modal from "react-modal";


  function CreateArea(props) {
  const [note, setNote] = useState([]);
  const [img, setImg] = useState("Demo.jpg");
  const [title, setTitle] = useState("Untitled");
  const [checked, setChecked] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [filename, setFilename] = useState('images/ujjtehlwjgsfqngxesnd');
  const [imageSelected, setImageSelected] = useState("");
  const [sims, setSims] = useState(createSelectItems());
  const [copy, setCopy] = useState(0);
  const [copiedParams, setCopiedParams] = useState()
    // sets all const
 const uploadImage = async event =>{
   event.preventDefault();
   const formData = new FormData()
   formData.append("file", imageSelected)
   formData.append("upload_preset", "scyblt6a")
   formData.append("folder", "images")
   try {
   await axios.post("https://api.cloudinary.com/v1_1/uottawaedusim/image/upload", formData)
   .then((res) => {
     let data = {
       gameinstance_name: title,
       gameinstance_photo_path: res.data.public_id,
       game_parameters: 'value',
       createdby_adminid: localStorage.adminid,
       status: 'created'
     }
       axios.post('http://localhost:5000/api/gameinstances/createGameInstance', data)
          .then((res) => {
             console.log(res)
            })
           .catch(error => console.log(error.response));
       props.onAdd(note);
   });
 } catch (error){
   let data = {
     gameinstance_name: title,
     gameinstance_photo_path: filename,
     game_parameters: 'value',
     createdby_adminid: localStorage.adminid,
     status: 'created'
   }
   if(copy === 1){
     await axios.post('http://localhost:5000/api/gameinstances/createGameInstance', data)
        .then((res) => {
          var body = {
              id: res.data.gameinstanceid,
              game_parameters: copiedParams,
              createdby_adminid: localStorage.adminid,
              invite_url: 'value'
            }
            axios.put('http://localhost:5000/api/gameinstances/update/:id', body)
               .then((res) => {
                  console.log(res)
                 })
                .catch(error => console.log(error.response));
          })
         .catch(error => console.log(error.response));
     props.onAdd(note);
   } else {
      await axios.post('http://localhost:5000/api/gameinstances/createGameInstance', data)
        .then((res) => {
           console.log(res)
          })
         .catch(error => console.log(error.response));
     props.onAdd(note);
   }
   }

   window.location.reload();
 };
  //handles selection of img from file
  function onChange(event){
    setImageSelected(event.target.files[0]);
    setImg(URL.createObjectURL(event.target.files[0]))
    setNote({
      title: title,
      img: URL.createObjectURL(event.target.files[0])
    });
  }
  //handle input and adds title and img to notes array
  function handleChange(event) {
    setTitle(event.target.value);
  }
  //handles showing of img overlay
  function handleImg(event){
     event.preventDefault();
     setImg(!img)
  }

  function createSelectItems() {
    let items = [(<option value="">Select a previous sim</option>)];
    for (let i = 0; i <=  props.gamedata.length -1; i++) {
         //here I will be creating my options dynamically based on
         items.push(<option value={i}>{props.gamedata[i].gameinstance_name}</option>);

         //what props are currently passed to the parent component
    }
    return items;
  }

  function handleCopySim(event) {
    //setting copy to 1 so when we add we can also update the params to copiedParams
    setCopy(1)
    setTitle(props.gamedata[event.target.value].gameinstance_name)
    setFilename(props.gamedata[event.target.value].gameinstance_photo_path)
    setNote({
      title: props.gamedata[event.target.value].gameinstance_name,
      img: props.gamedata[event.target.value].gameinstance_photo_path
    });
    setCopiedParams(props.gamedata[event.target.value].game_parameters)
  }
  return (
      <div class="area" >
          <form>
            <p class="gradient-border" id="box">
            Add New Simulation
            </p>
            <label for="Game">Choose a game</label>
            <select id="games">
              <option value="Team Leadership">Team Leadership</option>
              <option value="Project Management">Project Management</option>
              <option value="">...</option>
              <option value="blank">Create a blank simulation</option>
            </select>
            <p class="gradient-border" id="box1">
              Duplicate a previous simulation
              <label id="switch">
              <Switch
                onChange={() => setChecked(!checked)}
                checked={checked}
                className="react-switch"
              />
            </label>
            </p>
            {checked && <div>
                <label for="PrevGame" id="prevgame">Select a previous simulation</label>
                <select id="prevgames" onChange={handleCopySim}>
                  {createSelectItems()}
                </select>
              </div>}
              <p class="gradient-border" id="box3">
                Enter a ‎name‎‏‏‎ ‎
                <input
               type="text"
               id="namei"
               name="title"
               onChange={handleChange}
               value={note.title}
               placeholder="                         "
             />
              </p>
                <p class="gradient-border" id="box2" >
                  Choose an image
                  <img id="plus" src="plus.png" onClick={handleImg}/>

                  {(img)
                  ?<img id="preview" src={img} />
                  :<img id="previewno" src={img} />
                  }
                </p>
                <p>
                  <button id="add" onClick={uploadImage}>Add</button>
                </p>
              </form>
            {img && <div>
              <form id="imgs">
                <p id="box4" >
                  <img src="temp.png" onClick={() => {setFilename("images/lhd0g0spuityr8xps7vn"); setImg("temp.png");}}/>
                  <img src="temp1.png" onClick={() => {setFilename("images/i50xq1m2llbrg625zf9j"); setImg("temp1.png");}}/>
                  <img src="temp.png" onClick={() => {setFilename("images/lhd0g0spuityr8xps7vn"); setImg("temp.png");}}/>
                  <img src="temp1.png" onClick={() => {setFilename("images/i50xq1m2llbrg625zf9j"); setImg("temp1.png");}}/>
                  <img src="temp.png" onClick={() => {setFilename("images/lhd0g0spuityr8xps7vn"); setImg("temp.png");}}/>
                  <img src="temp1.png" onClick={() => {setFilename("images/i50xq1m2llbrg625zf9j"); setImg("temp1.png");}}/>
                <input
                      type="file"
                      name="img"
                      id="file"
                      onChange={onChange}
                      />
                    <label for="file">From file</label>
                </p>
              </form>
              </div>
            }
    </div>
  );
}

export default CreateArea;
