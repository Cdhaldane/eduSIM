import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ChromePicker } from 'react-color';
import axios from "axios";
import DropdownItem from "./DropdownItem";

import "./Dropdown.css";

const DropdownAddObjects = (props) => {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const [img, setImg] = useState();
  const dropdownRef = useRef(null);
  const [colour, setColour] = useState("");
  const [checkedd, setCheckedd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [imgsrc, setImgsrc] = useState("");
  const [vidsrc, setVidsrc] = useState("");
  const [audiosrc, setAudiosrc] = useState("");
  const [file, setFile] = useState("");

  function handleChange(e) {
    setColour(e);
    props.choosecolor(e);
  }

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.scrollHeight);

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleClickOutside = e => {
    if (!dropdownRef.current.contains(e.target)) {
      props.close();
    }
  }

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  const submitNote = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", img);
    formData.append("folder", "images");
    formData.append("uploader", localStorage.adminid);

    try {
      await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/image/upload', formData)
        .then((res) => {
          const allData = res.data.public_id;
          const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + allData + ".jpg";
          props.handleImage(name);
        });
    } catch (error) {
      console.log(error);
    }
  }

  const filesubmitNote = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "pdfs");
    formData.append("uploader", localStorage.adminid);

    try {
      await axios.post(process.env.REACT_APP_API_ORIGIN + '/api/image/upload', formData)
        .then((res) => {
          const allData = res.data.public_id;
          const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + allData + ".pdf";
          props.handleDocument(name);
        });
    } catch (error) {
      console.log(error);
    }
  }

  function handleImg(event) {
    setImg(event.target.files[0]);
  }

  function handleFile(event) {
    setFile(event.target.files[0]);
  }

  function addCircle() {
    props.addCircle();
    props.close();
  }

  function addRectangle() {
    props.addRectangle();
    props.close();
  }

  function addTriangle() {
    props.addTriangle();
    props.close();
  }

  function addStar() {
    props.addStar();
    props.close();
  }

  function drawLine() {
    setCheckedd(!checkedd)
    props.drawLine();
  }

  function drawText() {
    props.drawText();
    props.close();
  }

  function addImage(e) {
    props.addImage();
    props.close();
  }

  function addVideo(e) {
    props.addVideo();
    props.close();
  }

  function addAudio(e) {
    props.addAudio();
    props.close();
  }

  function addDocument(e) {
    props.addDocument();
    props.close();
  }

  function addTic(e) {
    props.addTic("clicked");
    props.close();
  }

  function addConnect() {
    props.addConnect();
    props.close();
  }

  function stopDrawing() {
    setChecked(!checked);
    props.stopDrawing();
  }

  function handleImage(e) {
    submitNote(e);
    setImgsrc(e.target.value);
    props.handleImage(imgsrc);
  }

  function handleVideo(e) {
    setVidsrc(e.target.value);
    props.handleVideo(vidsrc);
  }

  function handleAudio(e) {
    setAudiosrc(e.target.value);
    props.handleAudio(audiosrc);
  }

  function handleImgSubmit(e) {
    submitNote(e);
  }

  function handleFilesubmit(e) {
    filesubmitNote(e);
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <h1>{props.title}</h1>
          <DropdownItem
            leftIcon={<i className="icons fas fa-shapes"></i>}
            onClick={() => setActiveMenu("shapes")}>
            Add shapes
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-camera"></i>}
            onClick={() => setActiveMenu("media")}>
            Add Media
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-puzzle-piece"></i>}
            onClick={() => setActiveMenu("pieces")}>
            Game Piece
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'shapes'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>SHAPES!</h2>
          </DropdownItem>
          <DropdownItem onClick={addRectangle} leftIcon={<i className="icons fa fa-square" onClick={addRectangle} ></i>}>Square</DropdownItem>
          <DropdownItem onClick={addCircle} leftIcon={<i className="icons fa fa-circle" onClick={addCircle}></i>}>Circle</DropdownItem>
          <DropdownItem onClick={addTriangle} leftIcon={<i style={{fontSize: "2.0rem", transform: "scaleY(1.5) translateY(-0.05em)"}} className="icons fa fa-caret-up fa-2x" onClick={addTriangle}></i>}>Triangle</DropdownItem>
          <DropdownItem onClick={addStar} leftIcon={<i className="icons fa fa-star" onClick={addStar}></i>}>Star</DropdownItem>

          <DropdownItem
            leftIcon={<i className="icons fas fa-marker"></i>}
            onClick={() => setActiveMenu("draw")}>
            Drawing
          </DropdownItem>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'media'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>MEDIA!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fa fa-picture-o"></i>}
            onClick={() => setActiveMenu("image")}>
            Image
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-video" onClick=""></i>}
            onClick={() => setActiveMenu("video")}>
            Video
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-volume-up"></i>}
            onClick={() => setActiveMenu("audio")}>
            Sound
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-file"></i>}
            onClick={() => setActiveMenu("docs")}>
            Document
          </DropdownItem>
          <DropdownItem
            onClick={drawText}
            leftIcon={<i className="icons fas fa-comment-alt" onClick={drawText}></i>}>
            Textbox
          </DropdownItem>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'image'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>IMAGE!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={handleImgSubmit}></i>}>
          </DropdownItem>

          <input
            type="file"
            name="img"
            id="file"
            onChange={handleImg}
          />
          <label id="fileI" for="file">From file</label>
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={addImage}></i>}>
          </DropdownItem>

          <input id="imginput" type="text" placeholder="Image source..." onChange={handleImage} value={imgsrc} />
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={addImage}></i>}>
          </DropdownItem>

          <input id="imginputname" type="text" placeholder="Image name..." onChange={handleImage} value={imgsrc} />
          <DropdownItem
            onClick={addImage}
            leftIcon={<i className="icons fas fa-plus"
              onClick={addImage}></i>}>Add</DropdownItem>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'video'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>VIDEO!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={addVideo}></i>}>
          </DropdownItem>
          <input id="imginputv" type="text" placeholder="Video source..." onChange={handleVideo} value={vidsrc} />
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus"
              onClick={addVideo}></i>}>
          </DropdownItem>
          <input id="imginputvname" type="text" placeholder="Video name..." onChange={handleVideo} value={vidsrc} />
          <DropdownItem
            onClick={addVideo}
            leftIcon={<i className="icons fas fa-plus"
              onClick={addVideo}></i>}>Add</DropdownItem>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'audio'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>AUDIO!!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={addAudio}></i>}>
          </DropdownItem>
          <input id="imginputv" type="text" placeholder="Audio source..." onChange={handleAudio} value={audiosrc} />
          <DropdownItem
            onClick={addAudio}
            leftIcon={<i className="icons fas fa-plus" onClick={addAudio}></i>}>
            Add
          </DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'docs'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>DOCUMENTS!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons fas fa-plus" onClick={handleFilesubmit}></i>}>
          </DropdownItem>
          <input
            type="file"
            name="img"
            id="file"
            onChange={handleFile}
          />
          <label id="fileI" for="file">From file</label>

          <DropdownItem
            onClick={addDocument}
            leftIcon={<i className="icons fas fa-plus"
              onClick={addDocument}></i>}>Add</DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'draw'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("shapes")}>
            <h2>DRAW!</h2>
          </DropdownItem>
          <b id="colourp">
            <ChromePicker
              color={colour}
              disableAlpha={true}
              onChangeComplete={handleChange} />
          </b>

          <DropdownItem
            onClick={drawLine}
            leftIcon={<i className="icons fas fa-marker" onClick={drawLine}></i>}>
            Draw</DropdownItem>

          <DropdownItem
            onClick={stopDrawing}
            leftIcon={<i className="icons fas fa-mouse-pointer"
              onClick={stopDrawing}></i>}>Select</DropdownItem>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'pieces'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons fas fa-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>PIECES!</h2>
          </DropdownItem>
          <DropdownItem
            onClick={addTic}
            leftIcon={<i className="icons fas fa-times"
              onClick={addTic}></i>}>
            Tic-Tac-Toe</DropdownItem>
          <DropdownItem
            onClick={addConnect}
            leftIcon={<i className="icons fa fa-circle"
              onClick={addConnect}></i>}>
            Connect-Four</DropdownItem>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownAddObjects;
