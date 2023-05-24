import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import axios from "axios";
import DropdownItem from "./DropdownItem";
import { useAlertContext } from "../Alerts/AlertContext";
import Loading from "../Loading/Loading";
import { useTranslation } from "react-i18next";

import "./Dropdown.css";

import Star from "../../../public/icons/star.svg"
import Image from "../../../public/icons/image.svg"
import Hand from "../../../public/icons/pointer-top.svg"
import Question from "../../../public/icons/help.svg"
import Game from "../../../public/icons/game.svg"
import Text from "../../../public/icons/text.svg"
import TextAlt from "../../../public/icons/text-alt.svg"
import Square from "../../../public/icons/stop.svg"
import Circle from "../../../public/icons/circle.svg"
import Triangle from "../../../public/icons/triangle-9.svg"
import Line from "../../../public/icons/minus.svg"
import Draw from "../../../public/icons/paint-roller-alt-2.svg"
import Video from "../../../public/icons/video-camera-alt-2.svg"
import Audio from "../../../public/icons/volume-medium.svg"
import Document from "../../../public/icons/home-documents.svg"
import Graph from "../../../public/icons/graph.svg"
import Code from "../../../public/icons/code.svg"
import Timer from "../../../public/icons/stopwatch.svg"
import Cross from "../../../public/icons/stop.svg"
import Connect4 from "../../../public/icons/database.svg"
import Plus from "../../../public/icons/plus.svg"
import Check from "../../../public/icons/checkmark.svg"
import Radio from "../../../public/icons/radio-button.svg"
import Left from "../../../public/icons/arrow-left.svg"
import Club from "../../../public/icons/club.svg"
import Dice from "../../../public/icons/dice.svg"
const DEFAULT_STROKE = 2;

const DropdownAddObjects = (props) => {
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(274);
  const dropdownRef = useRef(null);

  const [imageUploaded, setImageUploaded] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploaded, setAudioUploaded] = useState(false);

  const [validImgURL, setValidImgURL] = useState(false);
  const [validVideoURL, setValidVideoURL] = useState(false);
  const [validAudioURL, setValidAudioURL] = useState(false);
  const [imgsrc, setImgsrc] = useState("");
  const [vidsrc, setVidsrc] = useState("");
  const [audiosrc, setAudiosrc] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(window.matchMedia("(orientation: portrait)").matches ? 0 : 70);
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



  useEffect(() => {
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



  const uploadFile = async (info, type) => {
    try {
      if (type === "image") {
        setImageUploading(true);
        const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + info.public_id + "." + info.format;
        setImageUploaded(true);
        setImageUploading(false);
        addImage(name, info)
        props.handleImage(name);
      } else if (type === "video") {
        setVideoUploading(true);
        const name = "https://res.cloudinary.com/uottawaedusim/video/upload/" + info.file + "." + info.format;
        setVideoUploaded(true);
        setVideoUploading(false);
        addVideo(name)
        props.handleVideo(name);
      } else if (type === "audio") {
        const name = "https://res.cloudinary.com/uottawaedusim/video/upload/" + info.file + "." + info.format;
        setAudioUploaded(true);
        addAudio(name)
        props.handleAudio(name);
      } else if (type === "pdf") {
        const name = "https://res.cloudinary.com/uottawaedusim/image/upload/" + info.file + "." + info.format;
        addDocument(name)
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
      name: objectName + numOfObj,
      type: objectName,
      ref: name,
      ...objectParameters,
      ...(isCustom ?
        {
          onTop: true
        } : {})
    };

    let newPages = [...props.state.pages];
    const thisPage = {...newPages[props.state.level - 1]};
    if (props.layer.attrs.name === "group") {
      const groupLayers = [...thisPage.groupLayers];
      isCustom ? groupLayers.unshift(name) : groupLayers.push(name);
      thisPage.groupLayers = groupLayers;
    } else if (props.layer.attrs.name === "personal") {
      const personalLayers = [...thisPage.personalLayers];
      isCustom ? personalLayers.unshift(name) : personalLayers.push(name);
      thisPage.personalLayers = personalLayers;
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

  const addImage = (img, info) => {
    console.log(info)
        addObjectToLayer(
          "images",
          {
            temporary: false,
            imgsrc: img,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            width: info.width,
            height: info.height
          }
        );
  }

  const addVideo = (video) => {
    addObjectToLayer(
      "videos",
      {
        vidsrc: video,
      }
    );
  }

  const addNewText = () => {
    addObjectToLayer(
      "richTexts",
      {
        editorState: null,
        draggable: true
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

  const addAudio = (audio) => {
    addObjectToLayer(
      "audios",
      {
        imgsrc: "sound.png",
        audsrc: audio,
      }
    );
  }

  const addDocument = (document) => {
    addObjectToLayer(
      "documents",
      {
        stroke: 'black',
        strokeWidth: 0,
        fillPatternImage: props.state.docimage,
        rotation: 0,
        width: 100,
        height: 100,
        docsrc: document
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

  const addDeck = () => {
    addObjectToLayer(
      "decks", {}
    );
  }

  const addDice = () => {
    addObjectToLayer(
      "dice", {}
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
        url.includes(".avi") ||
        url.includes(".youtube")
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
        uploadPreset: preset,
        singleUploadAutoClose:true
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
          console.log(result.info)
          uploadFile(result.info, type);
          myWidget.close();
        }
      }
    );
    props.close();
    myWidget.open();
  }


  return isLoading ? false : (
    <div
      className="dropdown"
      style={{
        height: menuHeight,
        transform: `translateX(${props.xPos - sidebarWidth + offsetX}px)
                    translateY(${props.yPos + offsetY}px)`,
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
            leftIcon={<i><Star className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("shapes")}>
            {t("edit.addShape")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Image className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("media")}>
            {t("edit.addMedia")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Hand className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("pieces")}>
            {t("edit.addInteractive")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Question className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("inputs")}>
            {t("edit.addInput")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Game className="icon add-icons"/></i>}
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addShape")}</h2>
          </DropdownItem>

          <DropdownItem
            onClick={addText}
            leftIcon={<i><Text className="icon add-icons"/></i>}>
            {t("edit.shape.simpleText")}
          </DropdownItem>

          <DropdownItem
            onClick={addNewText}
            leftIcon={<i><TextAlt className="icon add-icons"/></i>}>
            {t("edit.shape.richText")}
          </DropdownItem>
          <DropdownItem onClick={addRectangle} leftIcon={<i onClick={addRectangle} ><i><Square className="icon add-icons"/></i></i>}>{t("edit.shape.square")}</DropdownItem>
        <DropdownItem onClick={addCircle} leftIcon={<i  onClick={addCircle}><i><Circle className="icon add-icons"/></i></i>}>{t("edit.shape.circle")}</DropdownItem>
      <DropdownItem onClick={addTriangle} leftIcon={<i  onClick={addTriangle}><i><Triangle className="icon add-icons"/></i></i>}>{t("edit.shape.triangle")}</DropdownItem>
    <DropdownItem onClick={addStar} leftIcon={<i  onClick={addStar}><i><Star className="icon add-icons"/></i></i>}>{t("edit.shape.star")}</DropdownItem>
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
            leftIcon={<i><Draw className="icon add-icons"/></i>}
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addMedia")}</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Image className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("image")}>
            {t("edit.media.imageOrGif")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Video className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("video")}>
            {t("edit.media.video")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Audio className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("audio")}>
            {t("edit.media.audio")}
          </DropdownItem>
          <DropdownItem
            leftIcon={<i><Document className="icon add-icons"/></i>}
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addImage")}</h2>
          </DropdownItem>
          <div className={`${imageUploaded ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={
                !imageUploading ? (
                  <i onClick={(e) => {
                    if (imageUploaded) {
                      addImage(e);
                    }
                  }} ><i><Plus className="icon add-icons"/></i></i>
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
              leftIcon={<i onClick={(e) => {
                if (validImgURL) {
                  addImage(e);
                }
              }}><i><Plus className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addVideo")}</h2>
          </DropdownItem>



          <div className={`${validVideoURL ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i onClick={(e) => {
                if (validVideoURL) {
                  addVideo(vidsrc);
                }
              }}><i><Plus className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addAudio")}</h2>
          </DropdownItem>

          <div className={`${audioUploaded ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i  onClick={(e) => {
                if (audioUploaded) {
                  addAudio(e);
                }
              }}><i><Plus className="icon add-icons"/></i></i>}>
              <button type="button" className="add-media-button" onClick={() => openWidget("du7sbfat")}>
                {t("modal.imageFromFile")}
              </button>
            </DropdownItem>
          </div>

          <div className={`${validAudioURL ? "" : "dropdown-add-disabled"}`}>
            <DropdownItem
              leftIcon={<i  onClick={(e) => {
                if (validAudioURL) {
                  addAudio(e);
                }
              }}><i><Plus className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("media")}>
            <h2>{t("edit.media.addDocument")}</h2>
          </DropdownItem>
          <DropdownItem
            leftIcon={<i onClick={(e) => addDocument(e)}><i><Plus className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addInteractive")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={addPoll}
            leftIcon={<i
              onClick={addPoll}><i><Graph className="icon add-icons"/></i></i>}>
            {t("edit.interactive.poll")}</DropdownItem>
          <DropdownItem
            onClick={addHTMLFrame}
            leftIcon={<i
              onClick={addHTMLFrame}><i><Code className="icon add-icons"/></i></i>}>
            {t("edit.interactive.html")}</DropdownItem>

          <DropdownItem
            onClick={addTimer}
            leftIcon={<i
              onClick={addTimer}><i><Timer className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}

            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addGames")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={addTicTacToe}

            leftIcon={<i

              onClick={addTicTacToe}><i><Cross className="icon add-icons"/></i></i>}>
            {t("edit.game.tic")}</DropdownItem>
          <DropdownItem
            onClick={addDeck}
            leftIcon={<i onClick={addDeck}><i><Club className="icon add-icons"/></i></i>}>
            {t("edit.game.deck")}</DropdownItem>
          <DropdownItem
          onClick={addDice}
          leftIcon={<i onClick={addDice}><i><Dice className="icon add-icons"/></i></i>}>
          {t("edit.game.dice")}</DropdownItem>
          <DropdownItem
            onClick={addConnect4}

            leftIcon={<i

              onClick={addConnect4}><i><Connect4 className="icon add-icons"/></i></i>}>
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
            leftIcon={<i><Left className="icon add-icons"/></i>}
            onClick={() => setActiveMenu("main")}>
            <h2>{t("edit.addInput")}</h2>
          </DropdownItem>
          <DropdownItem
            onClick={() => addInput("button")}
            leftIcon={<i
              onClick={() => addInput("button")}><i><Hand className="icon add-icons"/></i></i>}>
            {t("edit.input.button")}</DropdownItem>
          <DropdownItem
            onClick={() => addInput("text")}
            leftIcon={<i
              onClick={() => addInput("text")}><i><Text className="icon add-icons"/></i></i>}>
            {t("edit.input.textbox")}</DropdownItem>
          <DropdownItem
            onClick={() => addInput("checkbox")}
            leftIcon={<i
              onClick={() => addInput("checkbox")}><i><Check className="icon add-icons"/></i></i>}>
            {t("edit.input.checkbox")}</DropdownItem>
            <DropdownItem
              onClick={() => addInput("radio")}
              leftIcon={<i
                onClick={() => addInput("radio")}><i><Radio className="icon add-icons"/></i></i>}>
              {t("edit.input.radio")}</DropdownItem>

              <DropdownItem
                onClick={() => addInput("variable")}
                leftIcon={<i
                  onClick={() => addInput("variable")}><i><Question className="icon add-icons"/></i></i>}>
                Variable</DropdownItem>
        </div>
      </CSSTransition>


    </div>
  );
}

export default DropdownAddObjects;

// <div className={`${videoUploaded ? "" : "dropdown-add-disabled"}`}>
//   <DropdownItem
//     leftIcon={
//       !videoUploading ? (
//
//         <i  onClick={(e) => {
//
//           if (videoUploaded) {
//             addVideo(e);
//           }
//         }} ><i><Plus className="icon add-icons"/></i></i>
//       ) : (
//         <div className="loadingMediaAddMenuContainer">
//           <Loading />
//         </div>
//       )
//     }>
//     <button type="button" className="add-media-button" onClick={() => openWidget("tj5ptxi8")} >
//       {t("modal.imageFromFile")}
//     </button>
//   </DropdownItem>
// </div>
//
