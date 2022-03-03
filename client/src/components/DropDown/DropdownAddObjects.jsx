import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios";
import DropdownItem from "./DropdownItem";
import { useAlertContext } from "../Alerts/AlertContext";
import Loading from "../Loading/Loading";
import { useTranslation } from "react-i18next";

import "./Dropdown.css";

const DEFAULT_STROKE = 2;

const DropdownAddObjects = (props) => {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(274);
  const dropdownRef = useRef(null);

  const [imageUploaded, setImageUploaded] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [fixX, setFixX] = useState(0);
  const [fixY, setFixY] = useState(0);

  const [validImgURL, setValidImgURL] = useState(false);
  const [validVideoURL, setValidVideoURL] = useState(false);
  const [validAudioURL, setValidAudioURL] = useState(false);
  const [imgsrc, setImgsrc] = useState("");
  const [vidsrc, setVidsrc] = useState("");
  const [audiosrc, setAudiosrc] = useState("");
  const [docfile, setFile] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(window.matchMedia("(orientation: portrait)").matches ? 0 : 70);

  const alertContext = useAlertContext();
  const { t } = useTranslation();

  const calcOutOfBounds = (x, y) => {
    const dropHeight = dropdownRef.current ? dropdownRef.current.clientHeight : 272;
    const dropWidth = dropdownRef.current ? dropdownRef.current.clientWidth : 298;
    const paddingPx = 7;
    const screenH = window.innerHeight - paddingPx;
    const screenW = window.innerWidth - paddingPx;

    let transformX = (x + dropWidth) - screenW;
    if (transformX < 0) {
      transformX = 0;
    }
    let transformY = (y + dropHeight) - screenH;
    if (transformY < 0) {
      transformY = 0;
    }
    return {
      x: transformX,
      y: transformY
    }
  }
  const [offsetX, setOffsetX] = useState(-calcOutOfBounds(props.xPos, props.yPos).x);
  const [offsetY, setOffsetY] = useState(-calcOutOfBounds(props.xPos, props.yPos).y);

  const isChrome = window.chrome;
  let winNav = window.navigator;
  let vendorName = winNav.vendor;
  let isChromeCheck = false;
  if(isChrome !== null && typeof isChrome !== "undefined" && vendorName === "Google Inc."){
    isChromeCheck=true;
  }

  useEffect(() => {
    if(isChrome){
      if(props.type === "overlay"){
        setFixX(930);
        setFixY(500)
      }
    }
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('contextmenu', handleReposition);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.removeEventListener('contextmenu', handleReposition);
    }
  }, []);

  const handleReposition = (e) => {
    const offset = calcOutOfBounds(e.clientX, e.clientY);
    setOffsetX(-offset.x);
    setOffsetY(-offset.y);
    setLoading(false);
  }

  const handleClickOutside = e => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      props.close();
    }
  }

  const calcHeight = (el) => {
    const height = el.offsetHeight;
    const matrix = new DOMMatrix(window.getComputedStyle(dropdownRef.current).transform);
    const y = matrix.m42;
    if (height + y > window.innerHeight) {
      const newOffset = menuHeight - height;
      setOffsetY(offsetY + newOffset);
    }

    setMenuHeight(height);
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
      console.error(error);
    }
  }

  const uploadFile = async (file, type, isGIF) => {
    try {
      if (type === "image") {
        setImageUploading(true);

        const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + file + ".jpg";
        setImageUploaded(true);
        setImageUploading(false);
        props.handleImage(name);
      } else if (type === "video") {
        setVideoUploading(true);
        const name = "https://res.cloudinary.com/uottawaedusim/video/upload/" + file + ".mp4";
        setVideoUploaded(true);
        setVideoUploading(false);
        props.handleVideo(name);
      } else if (type === "audio") {
        const name = "https://res.cloudinary.com/uottawaedusim/video/upload/" + file + ".mp3";
        setAudioUploaded(true);
        props.handleAudio(name);
      } else if (type === "pdf") {
        const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + file + ".pdf";
        props.handleDocument(name);
      }
    } catch (error) {
      if (type === "image") {
        setImageUploaded(false);
      } else if (type === "video") {
        setVideoUploaded(false);
      } else if (type === "audio") {
        setAudioUploaded(false);
      }
      console.error(error);
    }
  }

  const handleImgFromComputer = () => {
    const file = document.getElementById("filePickerImageEdit").files[0];
    if ((file.size / 1000000) > 10) {
      alertContext.showAlert(t("alert.imageTooLarge"), "warning");
      return;
    }
    if (!file.type.toString().includes("image")) {
      alertContext.showAlert(t("alert.fileNotImage"), "error");
      return;
    }

    uploadFile(file, "image", file.type.includes("gif"));
  }

  const handleVideoFromComputer = () => {
    const file = document.getElementById("filePickerVideoEdit").files[0];
    if (!file.type.toString().includes("video")) {
      alertContext.showAlert(t("alert.fileNotVideo"), "error");
      return;
    }

    uploadFile(file, "video");
  }

  const handleAudioFromComputer = () => {
    const file = document.getElementById("filePickerAudioEdit").files[0];
    if (!file.type.toString().includes("audio")) {
      alertContext.showAlert(t("alert.fileNotAudio"), "error");
      return;
    }

    uploadFile(file, "audio");
  }

  const handleFile = (event) => {
    setFile(event.target.files[0]);
  }

  // Adding Objects
  const addObjectToLayer = (objectName, objectParameters) => {
    const objectsState = props.state[objectName];
    const objectsDeletedState = parseInt(props.state[`${objectName}DeleteCount`]);
    const numOfObj = objectsState.length + (objectsDeletedState ? objectsDeletedState : 0) + 1;

    const isCustom = props.customObjects.includes(objectName);

    const name = objectName + numOfObj;
    let objX = props.state.selectedContextMenu.position.relX;
    let objY = props.state.selectedContextMenu.position.relY;
    const paddingPx = 7;
    const screenH = window.innerHeight - paddingPx;
    const screenW = window.innerWidth - paddingPx;

    if(objX > screenW) {
      objX = objX - 200;
    }
    if(objY > screenH) {
      objY = objY - 200;
    }

    const object = {
      rolelevel: props.state.rolelevel,
      infolevel: props.layer.attrs.name === "personal",
      overlay: props.type === "overlay",
      overlayIndex: props.type === "overlay" ? props.state.overlayOpenIndex : -1,
      level: props.state.level,
      visible: true,
      x: objX,
      y: objY,
      id: name,
      name: name,
      ref: name,
      ...objectParameters,
      ...(isCustom ?
        {
          onTop: true
        } : {})
    };

    let newPages = [...props.state.pages];
    const thisPage = newPages[props.state.level - 1];
    if (props.layer.attrs.name === "group") {

      isCustom ? thisPage.groupLayers.unshift(name) : thisPage.groupLayers.push(name);

    } else if (props.layer.attrs.name === "personal") {
      thisPage.personalLayers.push(name);
    } else {
      let oIndex = 0;
      const overlay = thisPage.overlays.filter((overlay, index) => {
        if (overlay.id === props.state.overlayOpenIndex) {
          oIndex = index;
          return true;
        } else {
          return false;
        }
      })[0];
      overlay.layers.push(name);
      thisPage.overlays[oIndex] = overlay;
    }
    newPages[props.state.level - 1] = thisPage;

    props.setState({
      [objectName]: [...objectsState, object],
      selectedShapeName: name,
      pages: newPages
    });

    props.close();
  }

  const addRectangle = () => {
    addObjectToLayer(
      "rectangles",
      {
        width: 100,
        height: 100,
        stroke: 'black',
        strokeWidth: DEFAULT_STROKE,
        rotation: 0,
        fill: props.state.colorf,
        useImage: false,
      }
    );
  }

  const addCircle = () => {
    addObjectToLayer(
      "ellipses",
      {
        radiusX: 50,
        radiusY: 50,
        stroke: 'black',
        strokeWidth: DEFAULT_STROKE,
        fill: props.state.colorf,
        rotation: 0
      }
    );
  }

  const addStar = () => {
    addObjectToLayer(
      "stars",
      {
        numPoints: 5,
        innerRadius: 30,
        outerRadius: 70,
        stroke: 'black',
        strokeWidth: DEFAULT_STROKE,
        fill: props.state.colorf,
        rotation: 0,
        width: 100,
        height: 100
      }
    );
  }

  const addLine = () => {
    addObjectToLayer(
      "lines",
      {
        stroke: 'black',
        strokeWidth: DEFAULT_STROKE,
        points: [0, 0, 1000, 0],
        opacity: 1,
      }
    );
  }

  const addTriangle = () => {
    addObjectToLayer(
      "triangles",
      {
        sides: 3,
        radius: 70,
        stroke: 'black',
        strokeWidth: DEFAULT_STROKE,
        useImage: false,
        fill: props.state.colorf,
        rotation: 0,
        width: 100,
        height: 100
      }
    );
  }

  const getMeta = (url, type, callback) => {
    if (type === "img") {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        callback(img.width, img.height);
      }
    } else {
      const video = document.createElement("video");
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        callback(video.videoWidth, video.videoHeight);
      });
    }
  }

  const addImage = () => {
    alertContext.showAlert(t("alert.loadingMedia"), "loading", 300000);
    getMeta(
      props.state.imgsrc,
      "img",
      (width, height) => {
        alertContext.showAlert(t("alert.loadedMedia"), "info");
        addObjectToLayer(
          "images",
          {
            temporary: false,
            imgsrc: props.state.imgsrc,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            width: width,
            height: height
          }
        );
      }
    );
  }

  const addVideo = () => {
    alertContext.showAlert(t("alert.loadingMedia"), "loading", 300000);
    getMeta(
      props.state.vidsrc,
      "video",
      (width, height) => {
        alertContext.showAlert(t("alert.loadedMedia"), "info");
        addObjectToLayer(
          "videos",
          {
            temporary: false,
            width: width,
            height: height,
            vidsrc: props.state.vidsrc,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1
          }
        );
      }
    );
  }

  const addText = () => {
    addObjectToLayer(
      "texts",
      {
        fontSize: 50,
        text: "Edit this",
        fontFamily: "Belgrano",
        opacity: 1,
        fill: props.state.colorf,
        rotation: 0,
        width: 300,
        height: 25
      }
    );
  }

  const addAudio = () => {
    addObjectToLayer(
      "audios",
      {
        imgsrc: "sound.png",
        audsrc: props.state.audsrc,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        width: 100,
        height: 100
      }
    );
  }

  const addDocument = () => {
    addObjectToLayer(
      "documents",
      {
        stroke: 'black',
        strokeWidth: 0,
        fillPatternImage: props.state.docimage,
        rotation: 0,
        width: 100,
        height: 100,
        docsrc: docfile
      }
    );
  }

  // Custom Components (Interactive)
  const addPoll = () => {
    addObjectToLayer(
      "polls",
      {
        performanceEnabled: false,
        customName: "",
        json: {
          pages: [
            {
              questions: [
                {
                  id: 0,
                  type: "text",
                  name: "0",
                  title: t("edit.sampleTextQuestion"),
                  isRequired: true,
                  performanceOption: props.type === "group" ? "groupResponse" : "personalResponse"
                }, {
                  id: 1,
                  type: "text",
                  name: "1",
                  inputType: "date",
                  title: t("edit.sampleDateQuestion"),
                  isRequired: false,
                  performanceOption: props.type === "group" ? "groupResponse" : "personalResponse"
                }, {
                  id: 2,
                  type: "boolean",
                  name: "2",
                  title: t("edit.sampleYesNoQuestion"),
                  isRequired: false,
                  performanceOption: props.type === "group" ? "groupResponse" : "personalResponse"
                }
              ]
            }
          ]
        }
      }
    );
  }

  const addHTMLFrame = () => {
    addObjectToLayer(
      "htmlFrames", {}
    );
  }

  const addTimer = () => {
    addObjectToLayer(
      "timers", { controls: true }
    );
  }

  const addConnect4 = () => {
    addObjectToLayer(
      "connect4s", {}
    );
  }

  const addTicTacToe = () => {
    addObjectToLayer(
      "tics", {}
    );
  }

  const addInput = (varType) => {
    addObjectToLayer(
      "inputs", { varType, label: t("edit.labelText") }
    );
  }

  // Other
  const imageURLGood = (url) => {
    if ((
      url.includes("http://") ||
      url.includes("https://")) && (
        url.includes(".png") ||
        url.includes(".jpg") ||
        url.includes(".jpeg") ||
        url.includes(".gif")
      )) {
      return true;
    } else {
      return false;
    }
  }

  const handleImage = (e) => {
    const url = e.target.value;
    if (imageURLGood(url)) {
      setValidImgURL(true);
      props.handleImage(url);
    } else {
      setValidImgURL(false);
    }
    setImgsrc(url);
  }

  const videoURLGood = (url) => {
    if ((
      url.includes("http://") ||
      url.includes("https://")) && (
        url.includes(".mp4") ||
        url.includes(".webm") ||
        url.includes(".ogv") ||
        url.includes(".avi")
      )) {
      return true;
    } else {
      return false;
    }
  }

  const handleVideo = (e) => {
    const url = e.target.value;
    if (videoURLGood(url)) {
      setValidVideoURL(true);
      props.handleVideo(url);
    } else {
      setValidVideoURL(false);
    }
    setVidsrc(url);
  }

  const audioURLGood = (url) => {
    if ((
      url.includes("http://") ||
      url.includes("https://")) && (
        url.includes(".mp3") ||
        url.includes(".wav")
      )) {
      return true;
    } else {
      return false;
    }
  }

  const handleAudio = (e) => {
    const url = e.target.value;
    if (audioURLGood(url)) {
      setValidAudioURL(true);
      props.handleAudio(url);
    } else {
      setValidAudioURL(false);
    }
    setAudiosrc(url);
  }

  const openWidget = (preset) => {

    let myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: "uottawaedusim",
        uploadPreset: preset
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          let type = "";
          if (preset == "bb8lewrh") {
            type = "image"
          } else if (preset == "tj5ptxi8") {
            type = "video"
          } else if (preset == "du7sbfat") {
            type = "audio"
          } else if (preset == "mfcgzpkg") {
            type == "pdf"
          }
          uploadFile(result.info.public_id, type);
        }
      }
    );
    myWidget.open();
  }

  return isLoading ? false : (
    <div
      className="dropdown"
      style={{
        height: menuHeight,
        transform: `translateX(${props.xPos - sidebarWidth + offsetX + fixX}px)
                    translateY(${props.yPos + offsetY + fixY}px)`,
      }}
      ref={dropdownRef}
      onContextMenu={(e) => {
        e.preventDefault();
      }}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu" style={{ textAlign: "left" }}>
          <h1>{props.title}</h1>
          <DropdownItem
            leftIcon={<i className="icons lni lni-star"></i>}
            onClick={() => setActiveMenu("shapes")}>
            {t("edit.addShape")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-image"></i>}
            onClick={() => setActiveMenu("media")}>
            {t("edit.addMedia")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-hand"></i>}
            onClick={() => setActiveMenu("pieces")}>
            {t("edit.addInteractive")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-help"></i>}
            onClick={() => setActiveMenu("inputs")}>
            {t("edit.addInput")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-game"></i>}
            onClick={() => setActiveMenu("games")}>
            {t("edit.addGames")}
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addShape")}</h2>
          </DropdownItem>

          <DropdownItem
            onClick={addText}
            leftIcon={<i className="icons lni lni-comments-alt" onClick={addText}></i>}>
            {t("edit.shape.text")}
          </DropdownItem>
          <DropdownItem onClick={addRectangle} leftIcon={<i className="icons lni lni-stop" onClick={addRectangle} ></i>}>{t("edit.shape.square")}</DropdownItem>
          <DropdownItem onClick={addCircle} leftIcon={<i className="icons lni lni-circle-plus" onClick={addCircle}></i>}>{t("edit.shape.circle")}</DropdownItem>
          <DropdownItem onClick={addTriangle} leftIcon={<i className="icons lni lni-play" onClick={addTriangle}></i>}>{t("edit.shape.triangle")}</DropdownItem>
          <DropdownItem onClick={addStar} leftIcon={<i className="icons lni lni-star" onClick={addStar}></i>}>{t("edit.shape.star")}</DropdownItem>
          <DropdownItem
            onClick={addLine}
            leftIcon={<i className="icons" onClick={addLine} style={{
              fontWeight: 800
            }}>
              /
            </i>}
          >
            {t("edit.shape.line")}
          </DropdownItem>

          <DropdownItem
            leftIcon={<i className="icons lni lni-brush" />}
            onClick={() => {
              props.setDrawMode(true);
              props.close();
            }}>
            {t("edit.shape.drawMode")}
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addMedia")}</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-image"></i>}
            onClick={() => setActiveMenu("image")}>
            {t("edit.media.imageOrGif")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-video"></i>}
            onClick={() => setActiveMenu("video")}>
            {t("edit.media.video")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-volume-high"></i>}
            onClick={() => setActiveMenu("audio")}>
            {t("edit.media.audio")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-add-files"></i>}
            onClick={() => setActiveMenu("docs")}>
            {t("edit.media.document")}
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addImage")}</h2>
          </DropdownItem>
          <div className={`${imageUploaded ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={
                !imageUploading ? (
                  <i className={`icons lni lni-plus`} onClick={(e) => {
                    if (imageUploaded) {
                      addImage(e);
                    }
                  }} />
                ) : (
                  <div className="loadingMediaAddMenuContainer">
                    <Loading />
                  </div>
                )
              }>
              <button type="button" className="add-media-button" onClick={() => openWidget("bb8lewrh")}>
                {t("modal.imageFromFile")}
              </button>

            </DropdownItem>
          </div>

          <div className={`${validImgURL ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i className="icons lni lni-plus" onClick={(e) => {
                if (validImgURL) {
                  addImage(e);
                }
              }}></i>}>
              <input className="add-dropdown-item-input" type="text" placeholder={t("edit.media.imageURL")} onChange={handleImage} value={imgsrc} />
            </DropdownItem>
          </div>
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addVideo")}</h2>
          </DropdownItem>

          <div className={`${videoUploaded ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={
                !videoUploading ? (

                  <i className={`icons lni lni-plus`} onClick={(e) => {

                    if (videoUploaded) {
                      addVideo(e);
                    }
                  }} />
                ) : (
                  <div className="loadingMediaAddMenuContainer">
                    <Loading />
                  </div>
                )
              }>
              <button type="button" className="add-media-button" onClick={() => openWidget("tj5ptxi8")} >
                {t("modal.imageFromFile")}
              </button>
            </DropdownItem>
          </div>

          <div className={`${validVideoURL ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i className="icons lni lni-plus" onClick={(e) => {
                if (validVideoURL) {
                  addVideo(e);
                }
              }}></i>}>
              <input className="add-dropdown-item-input" type="text" placeholder={t("edit.media.videoURL")} onChange={handleVideo} value={vidsrc} />
            </DropdownItem>
          </div>
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addAudio")}</h2>
          </DropdownItem>

          <div className={`${audioUploaded ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i className={`icons lni lni-plus`} onClick={(e) => {
                if (audioUploaded) {
                  addAudio(e);
                }
              }}></i>}>
              <button type="button" className="add-media-button" onClick={() => openWidget("du7sbfat")}>
                {t("modal.imageFromFile")}
              </button>
            </DropdownItem>
          </div>

          <div className={`${validAudioURL ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i className="icons lni lni-plus" onClick={(e) => {
                if (validAudioURL) {
                  addAudio(e);
                }
              }}></i>}>
              <input className="add-dropdown-item-input" type="text" placeholder={t("edit.media.audioURL")} onChange={handleAudio} value={audiosrc} />
            </DropdownItem>
          </div>
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addDocument")}</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i className="icons lni lni-plus" onClick={(e) => addDocument(e)}></i>}>
            <button type="button" className="add-media-button" onClick={() => openWidget("mfcgzpkg")}>
              {t("modal.imageFromFile")}
            </button>
          </DropdownItem>
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
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addInteractive")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={addPoll}
            leftIcon={<i className="icons lni lni-graph"
              onClick={addPoll}></i>}>
            {t("edit.interactive.poll")}</DropdownItem>
          <DropdownItem
            onClick={addHTMLFrame}
            leftIcon={<i className="icons lni lni-code"
              onClick={addHTMLFrame}></i>}>
            {t("edit.interactive.html")}</DropdownItem>

          <DropdownItem
            onClick={addTimer}
            leftIcon={<i className="icons lni lni-timer"
              onClick={addTimer}></i>}>
            {t("edit.interactive.timer")}</DropdownItem>
        </div>
      </CSSTransition>


      <CSSTransition
        in={activeMenu === 'games'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons lni lni-arrow-left"></i>}

            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addGames")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={addTicTacToe}

            leftIcon={<i className="icons lni lni-close"

              onClick={addTicTacToe}></i>}>
            {t("edit.game.tic")}</DropdownItem>
          <DropdownItem
            onClick={addConnect4}

            leftIcon={<i className="icons lni lni-database"

              onClick={addConnect4}></i>}>
            {t("edit.game.connect4")}</DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'inputs'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            leftIcon={<i className="icons lni lni-arrow-left"></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addInput")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={() => addInput("button")}
            leftIcon={<i className="icons lni lni-pointer-top"
              onClick={() => addInput("button")}></i>}>
            {t("edit.input.button")}</DropdownItem>
          <DropdownItem
            onClick={() => addInput("text")}
            leftIcon={<i className="icons lni lni-comments"
              onClick={() => addInput("text")}></i>}>
            {t("edit.input.textbox")}</DropdownItem>
          <DropdownItem
            onClick={() => addInput("checkbox")}
            leftIcon={<i className="icons lni lni-check-box"
              onClick={() => addInput("checkbox")}></i>}>
            {t("edit.input.checkbox")}</DropdownItem>
            <DropdownItem
              onClick={() => addInput("radio")}
              leftIcon={<i className="icons lni lni-radio-button"
                onClick={() => addInput("radio")}></i>}>
              {t("edit.input.radio")}</DropdownItem>

              <DropdownItem
                onClick={() => addInput("variable")}
                leftIcon={<i className="icons lni lni-help"
                  onClick={() => addInput("variable")}></i>}>
                Variable</DropdownItem>
        </div>
      </CSSTransition>


    </div>
  );
}

export default DropdownAddObjects;
