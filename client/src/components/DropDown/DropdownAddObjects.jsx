import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { ChromePicker } from 'react-color';
import axios from "axios";

import "./Dropdown.css";

function DropdownAddObjects(props) {
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
  }, []);

  const handleClickOutside = e => {
    if (!dropdownRef.current.contains(e.target)) {
      props.close();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <div className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </div>
    );
  }


  function DropdownItems(props) {
    return (
      <div className="menu-item" onClick={props.onClick}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </div>
    );
  }

  function DropdownItemImg(props) {
    return (
      <div className="menu-item">
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </div>
    );
  }

  const submitNote = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", img);
    formData.append("upload_preset", "scyblt6a");
    formData.append("folder", "images");

    try {
      await axios.post("https://api.cloudinary.com/v1_1/uottawaedusim/image/upload", formData)
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
    formData.append("upload_preset", "scyblt6a");
    formData.append("folder", "pdfs");

    try {
      await axios.post("https://api.cloudinary.com/v1_1/uottawaedusim/image/upload", formData)
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
            leftIcon={<i id="icons" className="fas fa-shapes"></i>}
            rightIcon={""}
            goToMenu="shapes">
            Add shapes
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-camera"></i>}
            rightIcon=""
            goToMenu="media">
            Add Media
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-puzzle-piece"></i>}
            rightIcon=""
            goToMenu="pieces">
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
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>SHAPES!</h2>
          </DropdownItem>
          <DropdownItems onClick={addRectangle} leftIcon={<i id="icons" className="fa fa-square" onClick={addRectangle} ></i>}>Square</DropdownItems>
          <DropdownItems onClick={addCircle} leftIcon={<i id="icons" className="fa fa-circle" onClick={addCircle}></i>}>Circle</DropdownItems>
          <DropdownItems onClick={addTriangle} leftIcon={<i id="iconst" className="fa fa-caret-up fa-2x" onClick={addTriangle}></i>}>Triangle</DropdownItems>
          <DropdownItems onClick={addStar} leftIcon={<i id="icons" className="fa fa-star" onClick={addStar}></i>}>Star</DropdownItems>

          <DropdownItem
            leftIcon={<i id="icons" className="fas fa-marker"></i>}
            rightIcon=""
            goToMenu="draw">
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
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>MEDIA!</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i id="icons" className="fa fa-picture-o"></i>}
            rightIcon=""
            goToMenu="image">
            Image
          </DropdownItem>
          <DropdownItem leftIcon={<i id="icons" className="fas fa-video" onClick=""></i>} goToMenu="video">Video</DropdownItem>
          <DropdownItem leftIcon={<i id="icons" className="fas fa-volume-up"></i>} goToMenu="audio">Sound</DropdownItem>
          <DropdownItem leftIcon={<i id="icons" className="fas fa-file"></i>} goToMenu="docs" >Document</DropdownItem>
          <DropdownItems onClick={drawText} leftIcon={<i id="icons" className="fas fa-comment-alt" onClick={drawText}></i>}>Textbox</DropdownItems>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'image'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="media" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>IMAGE!</h2>
          </DropdownItem>
          <DropdownItemImg
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={handleImgSubmit}></i>}>
          </DropdownItemImg>
          <input
            type="file"
            name="img"
            id="file"
            onChange={handleImg}
          />
          <label id="fileI" for="file">From file</label>

          <DropdownItemImg
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addImage}></i>}>
          </DropdownItemImg>
          <input id="imginput" type="text" placeholder="Image source..." onChange={handleImage} value={imgsrc} />
          <DropdownItemImg
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addImage}></i>}>
          </DropdownItemImg>
          <input id="imginputname" type="text" placeholder="Image name..." onChange={handleImage} value={imgsrc} />
          <DropdownItems
            onClick={addImage}
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addImage}></i>}>Add</DropdownItems>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'video'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="media" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>VIDEO!</h2>
          </DropdownItem>
          <DropdownItems
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addVideo}></i>}>
          </DropdownItems>
          <input id="imginputv" type="text" placeholder="Video source..." onChange={handleVideo} value={vidsrc} />
          <DropdownItems
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addVideo}></i>}>
          </DropdownItems>
          <input id="imginputvname" type="text" placeholder="Video name..." onChange={handleVideo} value={vidsrc} />
          <DropdownItems
            onClick={addVideo}
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addVideo}></i>}>Add</DropdownItems>
        </div>
      </CSSTransition>
      <CSSTransition
        in={activeMenu === 'audio'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="media" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>AUDIO!!</h2>
          </DropdownItem>
          <DropdownItems
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addAudio}></i>}>
          </DropdownItems>
          <input id="imginputv" type="text" placeholder="Audio source..." onChange={handleAudio} value={audiosrc} />
          <DropdownItems
            onClick={addAudio}
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addAudio}></i>}>Add</DropdownItems>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'docs'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="media" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>DOCUMENTS!</h2>
          </DropdownItem>
          <DropdownItemImg
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={handleFilesubmit}></i>}>
          </DropdownItemImg>
          <input
            type="file"
            name="img"
            id="file"
            onChange={handleFile}
          />
          <label id="fileI" for="file">From file</label>

          <DropdownItems
            onClick={addDocument}
            leftIcon={<i id="icons" className="fas fa-plus"
              onClick={addDocument}></i>}>Add</DropdownItems>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'draw'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="shapes" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>DRAW!</h2>
          </DropdownItem>
          <b id="colourp">
            <ChromePicker
              color={colour}
              disableAlpha={true}
              onChangeComplete={handleChange} />
          </b>

          <DropdownItems
            onClick={drawLine}
            leftIcon={<i id="icons" className="fas fa-marker" onClick={drawLine}></i>}>
            Draw</DropdownItems>

          <DropdownItems
            onClick={stopDrawing}
            leftIcon={<i id="icons" className="fas fa-mouse-pointer"
              onClick={stopDrawing}></i>}>Select</DropdownItems>

        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'pieces'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<i id="icons" className="fas fa-arrow-left"></i>}>
            <h2>PIECES!</h2>
          </DropdownItem>
          <DropdownItems
            onClick={addTic}
            leftIcon={<i id="icons" className="fas fa-times"
              onClick={addTic}></i>}>
            Tic-Tac-Toe</DropdownItems>
          <DropdownItems
            onClick={addConnect}
            leftIcon={<i id="icons" className="fa fa-circle"
              onClick={addConnect}></i>}>
            Connect-Four</DropdownItems>
        </div>
      </CSSTransition>
    </div>
  );
}

export default DropdownAddObjects;
