import React, { useState, useEffect, Component } from 'react';
import Dropdownroles from "../DropDown/Dropdownroles";
import URLvideo from "./URLVideos";
import { v1 as uuidv1 } from 'uuid';
import fileDownload from 'js-file-download'
import axios from 'axios'
import {Link } from "react-router-dom";
import Level from "../Level/Level";
import Pencil from "../Pencils/Pencil";
import Konva from "konva"
import ContextMenu from "../ContextMenu/ContextMenu";
import ContextMenuText from "../ContextMenu/ContextMenuText";
import Portal from "./Shapes/Portal"
import {
  Rect,
  Stage,
  Layer,
  Transformer,
  Ellipse,
  Star,
  Text,
  RegularPolygon,
  Line,
  Arrow,
  Image
} from "react-konva";
import Connector from "./Connector.jsx";

  class URLImage extends React.Component {
    state = {
      image: null
    };
    componentDidMount() {
      this.loadImage();
    }
    componentDidUpdate(oldProps) {
      if (oldProps.src !== this.props.src) {
        this.loadImage();
      }
    }
    componentWillUnmount() {
      this.image.removeEventListener('load', this.handleLoad);
    }
    loadImage() {
      // save to "this" to remove "load" handler on unmount
      this.image = new window.Image();
      this.image.src = this.props.src;
      this.image.addEventListener('load', this.handleLoad);
    }
    handleLoad = () => {
      // after setState react-konva will update canvas and redraw the layer
      // because "image" property is changed
      this.setState({
        image: this.image
      });
      // if you keep same image object during source updates
      // you will have to update layer manually:
      // this.imageNode.getLayer().batchDraw();
    };
    render() {
      return (
        <Image
          draggable
          visible={this.props.visible}
          x={this.props.x}
          y={this.props.y}
          width={this.props.width}
          height={this.props.height}
          image={this.state.image}
          ref={this.props.ref}
          id={this.props.id}
          name="shape"
          opacity={this.props.opacity}
          onClick={this.props.onClick}
          onTransformStart={this.props.onTransformStart}
          onTransform={this.props.onTransform}
          onTransformEnd={this.props.onTransformEnd}
          onDragMove={this.props.onDragMove}
          onDragEnd={this.props.onDragEnd}
          onContextMenu={this.props.onContextMenu}
          rotation={this.props.rotation}
          stroke={this.props.stroke}
          strokeWidth={this.props.strokeWidth}
        />
      );
    }
  }
  function Timer(props){
    useEffect(() => {
      const MINUTE_MS = 300000;
      const interval = setInterval(() => {
        console.log("Saves every 5 minutes.")
        props.handleSave()
      }, MINUTE_MS);

      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])

    return (
      <>
       <Save />
      </>
    );
  }
  function Save(){
    const [display, setDisplay] = useState(false);
    useEffect(() => {
      const MINUTE_MS = 300000;
      const interval = setInterval(() => {
        setDisplay(true)
      }, MINUTE_MS);

      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])
    useEffect(() => {
      const MINUTE_MS = 306000;
      const interval = setInterval(() => {
        setDisplay(false)
      }, MINUTE_MS);

      return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    }, [])
    return (
      <>
       {display && <div >
         <p id="saved">
          <h1>Auto saved!</h1>
         </p>
         </div>
       }
      </>
    );
  }

class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }
  checkNode() {
    // const stage = this.transformer.getStage();
    //
    // const { selectedShapeName } = this.props;
    // if (selectedShapeName === "") {
    //   this.transformer.detach();
    //   console.log(1)
    //   return;
    // }
    // const selectedNode = stage.findOne("." + selectedShapeName);
    // if (selectedNode === this.transformer.node()) {
    //   return;
    // }
    //
    // if (selectedNode) {
    //   this.transformer.attachTo(selectedNode);
    //   console.log(2)
    // } else {
    //   this.transformer.detach();
    //   console.log(3)
    // }
    // this.transformer.getLayer().batchDraw();
  }
  render() {
    if (this.props.selectedShapeName.includes("text")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
          enabledAnchors={["middle-left", "middle-right"]}
        />
      );
    } else if (this.props.selectedShapeName.includes("star")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
          ]}
        />
      );
    } else if (this.props.selectedShapeName.includes("arrow")) {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          resizeEnabled={false}
          rotateEnabled={false}
        />
      );
    } else {
      var stuff = (
        <Transformer
          ref={node => {
            this.transformer = node;
          }}
          name="transformer"
          keepRatio={true}
        />
      );
    }
    return stuff;
  }
}

var history = [];
var historyStep = 0;

class Graphics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layerX: 0,
      layerY: 0,
      layerScale: 1,
      selectedShapeName: "",
      errMsg: "",
      rectangles: [],
      ellipses: [],
      stars: [],
      triangles: [],
      images: [],
      videos: [],
      audios: [],
      documents: [],
      texts: [],
      lines: [],
      arrows: [],
      connectors: [],
      gameroles: [],
      currentTextRef: "",
      shouldTextUpdate: true,
      textX: 0,
      textY: 0,
      textEditVisible: false,
      arrowDraggable: false,
      newArrowRef: "",
      count: 0,
      newArrowDropped: false,
      newConnectorDropped: false,
      arrowEndX: 0,
      arrowEndY: 0,
      isTransforming: false,
      lastFill: null,
      selectedContextMenu:null,
      selectedContextMenuText:null,
      colorf: "black",
      colors: "black",
      color: "white",
      strokeWidth: 3.75,
      opacity: 1,
      infolevel: false,
      rolelevel: "",

      open: 0,
      state: false,



      saving: null,
      saved: [],
      roadmapId: null,
      alreadyCreated: false,
      publishing: false,
      title: "",
      category: "",
      description: "",
      thumbnail: "",
      isPasteDisabled: false,
      ellipseDeleteCount: 0,
      starDeleteCount: 0,
      arrowDeleteCount: 0,
      textDeleteCount: 0,
      rectDeleteCount: 0,
      triangleDeleteCount: 0,
      imageDeleteCount: 0,
      videoDeleteCount: 0,
      linesDeleteCount: 0,
      audioDeletedCount: 0,
      gameinstanceid: this.props.gameinstance,
      adminid: this.props.adminid,
      savedstates: [],
      draggable: false,
      level: 1,
      tool: 'pen',
      isDrawing: false,
      drawMode: false,
      ptype: "",
      pageNumber: 6,
      imagesrc: null,
      vidsrc: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Physicsworks.ogv/Physicsworks.ogv.240p.vp9.webm",
      imgsrc: "https://konvajs.org/assets/lion.png",
      audsrc: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/shoptalk-clip.mp3",
      docsrc: "",
      docimage: null,
      selection: {visible: false,
                  x1: -100,
                  y1: -100,
                  x2: 0,
                  y2: 0}
                  };

    this.handleWheel = this.handleWheel.bind(this);

    axios.get('http://localhost:5000/api/gameinstances/getGameInstance/:adminid/:gameid', {
      params: {
            adminid: this.state.adminid,
            gameid: this.state.gameinstanceid
        }
    })
    .then((res) => {
      const allData = res.data;
      console.log(JSON.parse(allData.game_parameters));
      this.setState({
        rectangles: JSON.parse(allData.game_parameters)[0] || []
      })
      this.setState({
        ellipses:JSON.parse(allData.game_parameters)[1] || []
      })
      this.setState({
        stars: JSON.parse(allData.game_parameters)[2] || []
      })
      this.setState({
        texts: JSON.parse(allData.game_parameters)[3] || []
      })
      this.setState({
        arrows: JSON.parse(allData.game_parameters)[4] || []
      })
      this.setState({
        triangles: JSON.parse(allData.game_parameters)[5] || []
      })
      this.setState({
        images: JSON.parse(allData.game_parameters)[6] || []
      })
      this.setState({
        videos: JSON.parse(allData.game_parameters)[7] || []
      })
      this.setState({
        audios: JSON.parse(allData.game_parameters)[8] || []
      })
      this.setState({
        documents: JSON.parse(allData.game_parameters)[9] || []
      })
      this.setState({
        lines: JSON.parse(allData.game_parameters)[10] || []
      })
    })
    .catch(error => console.log(error.response));
    axios.get('http://localhost:5000/api/gameroles/getGameRoles/:gameinstanceid', {
      params: {
            gameinstanceid: this.state.gameinstanceid,
        }
    })
  }

  handleType = (e) => {
    this.setState({
      ptype: e
    })
  }
  handleNum = (e) => {
    this.setState({
      pageNumber: e
    })
  }
  handleMvisible = (e) => {
    this.props.mvisible(e)
  }
   handleAvisible = (e) => {
    this.props.avisible(e)
  }
   handlePavisible = (e) => {
    this.props.pavisible(e)
  }
   handleSvisible = (e) => {
    this.props.svisible(e)
  }
   handlePevisible = (e) => {
    this.props.pevisible(e)
  }

  handleSave = () => {
    const rects = this.state.rectangles,
      ellipses = this.state.ellipses,
      stars = this.state.stars,
      texts = this.state.texts,
      arrows = this.state.arrows,
      triangles = this.state.triangles,
      images = this.state.images,
      videos = this.state.videos,
      audios = this.state.audios,
      documents = this.state.documents,
      lines = this.state.lines,
      status = "Up";
    // if (
    //   JSON.stringify(this.state.saved) !==
    //   JSON.stringify([rects, ellipses, stars, texts, arrows, triangles, images, videos, audios, documents])
    // ) {
      this.setState({ saved: [rects, ellipses, stars, texts, arrows, triangles, images, videos, audios, documents, lines, status: "up"] });
      console.log(this.state.saved)
              console.log(this.state.gameinstanceid)
              var body = {
                  id: this.state.gameinstanceid,
                  game_parameters: JSON.stringify(this.state.saved),
                  createdby_adminid: localStorage.adminid,
                  invite_url: 'value'
                }

                console.log(this.state.saved)
                console.log(this.props)

                axios.put('http://localhost:5000/api/gameinstances/update/:id', body)
                   .then((res) => {
                      console.log(res)
                     })
                    .catch(error => console.log(error.response));
                   console.log();
  };

  handleStageClick = e => {
    var pos = this.refs.layer2.getStage().getPointerPosition();
    var shape = this.refs.layer2.getIntersection(pos);

    console.log("texts", this.state.texts);

    if (
      shape !== null &&
      shape.name() !== undefined &&
      shape !== undefined &&
      shape.name() !== undefined
    ) {
      this.setState(
        {
          selectedShapeName: shape.id()
        },
        () => {
          this.refs.graphicStage.draw();
        }
      );
    }
  };

  updateSelectionRect = () => {

    const node = this.refs.selectionRectRef;
    node.setAttrs({
      visible: this.state.selection.visible,
      x: Math.min(this.state.selection.x1, this.state.selection.x2),
      y: Math.min(this.state.selection.y1, this.state.selection.y2),
      width: Math.abs(this.state.selection.x1 - this.state.selection.x2),
      height: Math.abs(this.state.selection.y1 - this.state.selection.y2),
      fill: "rgba(0, 161, 255, 0.3)"
    });
    node.getLayer().batchDraw();
  };

  onMouseDown = (e) => {
    this.setState({
      draggable: false
    })
    const pos = e.target.getStage().getPointerPosition();
    if(this.state.drawMode === true) {
    this.state.isDrawing = true;
    const tool = this.state.tool;
    this.setState({
      lines: [...this.state.lines, { tool, points: [pos.x, pos.y], level: this.state.level, color: this.state.color, id: "shape", infolevel: this.state.infolevel}]
    })
  } else {

    const isElement = e.target.findAncestor(".elements-container");
    const isTransformer = e.target.findAncestor("Transformer");
    if (isElement || isTransformer) {
      return;
    }
    this.state.selection.visible = true;
    this.state.selection.x1 = pos.x;
    this.state.selection.y1 = pos.y;
    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRect();
  }
  };


  handleMouseUp = () => {
    if(this.state.drawMode === true) {
      this.state.isDrawing = false;
    } else {
    if (!this.state.selection.visible) {
      return;
    }
    const selBox = this.refs.selectionRectRef.getClientRect();
    const elements = [];
    this.refs.layer2.find(".shape").forEach((elementNode) => {
      const elBox = elementNode.getClientRect();
      if (Konva.Util.haveIntersection(selBox, elBox)) {
        elements.push(elementNode);

      }
    });


    this.refs.trRef.transformer.nodes(elements);
    this.state.selection.visible = false;
    // disable click event
    Konva.listenClickTap = false;
    this.updateSelectionRect();
  }
  };

  handleMouseOver = event => {

    //get the currennt arrow ref and modify its position by filtering & pushing again
    //console.log("lastFill: ", this.state.lastFill);
    if(this.state.drawMode === true) {
    if (!this.state.isDrawing) {
      return;
   }

   const stage = event.target.getStage();
   const point = stage.getPointerPosition();
   let lastLine = this.state.lines[this.state.lines.length - 1];
   // add point
   lastLine.points = lastLine.points.concat([point.x, point.y]);

   // replace last
   this.state.lines.splice(this.state.lines.length - 1, 1, lastLine);
   this.setState({
     lines: this.state.lines.concat()
   })
 } else {


    if (!this.state.selection.visible) {
      return;
    }
    var pos = this.refs.graphicStage.getPointerPosition();
    var shape = this.refs.graphicStage.getIntersection(pos);

    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRect();

    if (shape && shape.attrs.link) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  }
  };
  updateSelectionRectInfo = () => {

    const node = this.refs.selectionRectRef1;
    node.setAttrs({
      visible: this.state.selection.visible,
      x: Math.min(this.state.selection.x1, this.state.selection.x2),
      y: Math.min(this.state.selection.y1, this.state.selection.y2),
      width: Math.abs(this.state.selection.x1 - this.state.selection.x2),
      height: Math.abs(this.state.selection.y1 - this.state.selection.y2),
      fill: "rgba(0, 161, 255, 0.3)"
    });
    node.getLayer().batchDraw();
  };
  onMouseDownInfo = (e) => {
    this.setState({
      draggable: false
    })
    const pos = e.target.getStage().getPointerPosition();
    if(this.state.drawMode === true) {
    this.state.isDrawing = true;
    const tool = this.state.tool;
    this.setState({
      lines: [...this.state.lines, { tool, points: [pos.x, pos.y], level: this.state.level, color: this.state.color, id: "shape", infolevel: this.state.infolevel, rolelevel: this.state.rolelevel}]
    })
  } else {

    const isElement = e.target.findAncestor(".elements-container");
    const isTransformer = e.target.findAncestor("Transformer");
    if (isElement || isTransformer) {
      return;
    }
    this.state.selection.visible = true;
    this.state.selection.x1 = pos.x;
    this.state.selection.y1 = pos.y;
    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRectInfo();
  }
  };


  handleMouseUpInfo = () => {
    if(this.state.drawMode === true) {
      this.state.isDrawing = false;
    } else {
    if (!this.state.selection.visible) {
      return;
    }
    const selBox = this.refs.selectionRectRef1.getClientRect();
    const elements = [];
    this.refs.layer3.find(".shape").forEach((elementNode) => {
      const elBox = elementNode.getClientRect();
      if (Konva.Util.haveIntersection(selBox, elBox)) {
        elements.push(elementNode);

      }
    });


    this.refs.trRef1.transformer.nodes(elements);
    this.state.selection.visible = false;
    // disable click event
    Konva.listenClickTap = false;
    this.updateSelectionRectInfo();
  }
  };

  handleMouseOverInfo = event => {

    //get the currennt arrow ref and modify its position by filtering & pushing again
    //console.log("lastFill: ", this.state.lastFill);
    if(this.state.drawMode === true) {
    if (!this.state.isDrawing) {
      return;
   }

   const stage = event.target.getStage();
   const point = stage.getPointerPosition();
   let lastLine = this.state.lines[this.state.lines.length - 1];
   // add point
   lastLine.points = lastLine.points.concat([point.x, point.y]);

   // replace last
   this.state.lines.splice(this.state.lines.length - 1, 1, lastLine);
   this.setState({
     lines: this.state.lines.concat()
   })
 } else {


    if (!this.state.selection.visible) {
      return;
    }
    var pos = this.refs.graphicStage1.getPointerPosition();
    var shape = this.refs.graphicStage1.getIntersection(pos);

    this.state.selection.x2 = pos.x;
    this.state.selection.y2 = pos.y;
    this.updateSelectionRectInfo();

    if (shape && shape.attrs.link) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }
  }
  };
  handleWheel(event) {
    if (
      this.state.rectangles.length === 0 &&
      this.state.ellipses.length === 0 &&
      this.state.stars.length === 0 &&
      this.state.texts.length === 0 &&
      this.state.triangles.length === 0 &&
      this.state.arrows.length === 0 &&
      this.state.images.length === 0 &&
      this.state.videos.length === 0 &&
      this.state.audios.length === 0 &&
      this.state.documents.length === 0 &&
      this.state.lines.length === 0
    ) {
    } else {
      event.evt.preventDefault();
      const scaleBy = 1.2;
      const stage = this.refs.graphicStage;
      const layer = this.refs.layer2;
      const oldScale = layer.scaleX();
      const mousePointTo = {
        x:
          stage.getPointerPosition().x / oldScale -
          this.state.layerX / oldScale,
        y:
          stage.getPointerPosition().y / oldScale - this.state.layerY / oldScale
      };

      const newScale =
        event.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

      layer.scale({ x: newScale, y: newScale });

      /*  console.log(
        oldScale,
        mousePointTo,
        stage.getPointerPosition().x,
        stage.getPointerPosition().y
      );
    */
      this.setState({
        layerScale: newScale,
        layerX:
          -(mousePointTo.x - stage.getPointerPosition().x / newScale) *
          newScale,
        layerY:
          -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    let prevMainShapes = [
      prevState.rectangles,
      prevState.ellipses,
      prevState.stars,
      prevState.arrows,
      prevState.connectors,
      prevState.texts,
      prevState.triangles,
      prevState.images,
      prevState.videos,
      prevState.audios,
      prevState.lines,
      prevState.documents
    ];
    let currentMainShapes = [
      this.state.rectangles,
      this.state.ellipses,
      this.state.stars,
      this.state.arrows,
      this.state.connectors,
      this.state.texts,
      this.state.triangles,
      this.state.images,
      this.state.videos,
      this.state.audios,
      this.state.lines,
      this.state.documents
    ];

    if (!this.state.redoing && !this.state.isTransforming)
      if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
        if (
          JSON.stringify(prevMainShapes) !== JSON.stringify(currentMainShapes)
        ) {
          //if text shouldn't update, don't append to  history
          if (this.state.shouldTextUpdate) {
            var uh = history;
            history = uh.slice(0, historyStep + 1);
            //console.log("sliced", history);
            var toAppend = this.state;
            history = history.concat(toAppend);
            //console.log("new", history);
            historyStep += 1;
            //console.log(history, historyStep, history[historyStep]);
          }
        }
      } else {
        //console.log("compoenntDidUpdate but attrs didn't change");
      }
    this.state.redoing = false;
  }

  handleUndo = () => {
    this.handleSave()
    if (!this.state.isTransforming) {
      if (!this.state.textEditVisible) {
        if (historyStep === 0) {
          return;
        }
        historyStep -= 1;

        this.setState(
          {
            rectangles: history[historyStep].rectangles,
            arrows: history[historyStep].arrows,
            ellipses: history[historyStep].ellipses,
            triangles: history[historyStep].triangles,
            images: history[historyStep].images,
            lines: history[historyStep].lines,
            videos: history[historyStep].videos,
            audios: history[historyStep].audios,
            stars: history[historyStep].stars,
            texts: history[historyStep].texts,
            documents: history[historyStep].documents,
            connectors: history[historyStep].connectors,
            redoing: true,
            selectedShapeName: this.shapeIsGone(history[historyStep])
              ? ""
              : this.state.selectedShapeName
          },
          () => {
            this.refs.graphicStage.draw();
          }
        );
      }
      this.setState({
        selectedContextMenu: false,
        selectedContextMenuText: false
      })
    }
  };

  handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    this.setState(
      {
        rectangles: next.rectangles,
        arrows: next.arrows,
        ellipses: next.ellipses,
        triangles: next.triangles,
        images: next.images,
        videos: next.videos,
        audios: next.audios,
        documents: next.documents,
        lines: next.lines,
        stars: next.stars,
        texts: next.texts,
        redoing: true,
        selectedShapeName: this.shapeIsGone(history[historyStep])
          ? ""
          : this.state.selectedShapeName
      },
      () => {
        this.forceUpdate();
      }
    );
    this.setState({
      selectedContextMenu: false,
      selectedContextMenuText: false
    })
  };

  handleCopy = () => {
    if (this.state.selectedShapeName !== "") {
      //find it
      let name = this.state.selectedShapeName;
      let copiedElement = null;
      if (name.includes("rect")) {
        console.log(this.state.rectangles)
        copiedElement = this.state.rectangles.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("ellipse")) {
        copiedElement = this.state.ellipses.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("triangle")) {
        copiedElement = this.state.triangles.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("image")) {
        console.log(this.state.images)
        copiedElement = this.state.images.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
      } else if (name.includes("video")) {
        copiedElement = this.state.videos.filter(function(
          eachRect
        ) {
          return eachRect.name === name;
        });
     }  else if (name.includes("audio")) {
       copiedElement = this.state.audios.filter(function(
         eachRect
       ) {
         return eachRect.name === name;
       });
    }    else if (name.includes("document")) {
      copiedElement = this.state.documents.filter(function(
        eachRect
      ) {
        return eachRect.name === name;
      });
    } else if (name.includes("star")) {
        copiedElement = this.state.stars.filter(function(eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("text")) {
        copiedElement = this.state.texts.filter(function(eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("arrow")) {
        copiedElement = this.state.arrows.filter(function(eachRect) {
          return eachRect.name === name;
        });
      } else if (name.includes("line")) {
        copiedElement = this.state.lines.filter(function(eachRect) {
          return eachRect.name === name;
        });
      }

      this.setState({ copiedElement: copiedElement }, () => {
        console.log("copied ele", this.state.copiedElement);
      });
      this.setState({
        selectedContextMenu: false,
        selectedContextMenuText: false
      })
    }
  }

  handlePaste = () => {
    let copiedElement = this.state.copiedElement[0];
    console.log(copiedElement);
    var length;
    if (copiedElement) {
      if (copiedElement.attrs) {
      } else {
        if (copiedElement.name.includes("rectangle")) {
          length =
            this.state.rectangles.length +
            1 +
            this.state.rectDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            width: copiedElement.width,
            height: copiedElement.height,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "rectangle" +
              (this.state.rectangles.length +
                this.state.rectDeleteCount +
                1),
            ref:
              "rectangle" +
              (this.state.rectangles.length +
                this.state.rectDeleteCount +
                1),
            fill: copiedElement.fill,
            useImage: copiedElement.useImage,
            link: copiedElement.link,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              rectangles: [...prevState.rectangles, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName:
                  "rectangle" + this.state.rectangles.length
              });
            }
          );
        } else if (copiedElement.name.includes("arrow")) {
          length =
            this.state.arrows.length +
            1 +
            this.state.arrowDeleteCount;

          if (copiedElement.to || copiedElement.from) {
            this.setState(
              {
                errMsg: "Connectors cannot be pasted"
              },
              () => {
                var that = this;
                setTimeout(function() {
                  that.setState({
                    errMsg: ""
                  });
                }, 1000);
              }
            );
          } else {
            var toPush = {
              points: [
                copiedElement.points[0] + 30,
                copiedElement.points[1] + 30,
                copiedElement.points[2] + 30,
                copiedElement.points[3] + 30
              ],
              fill: copiedElement.fill,
              link: copiedElement.link,
              stroke: copiedElement.stroke,
              strokeWidth: copiedElement.strokeWidth,
              id:
                "arrow" +
                (this.state.arrows.length +
                  1 +
                  this.state.arrowDeleteCount),
              ref:
                "arrow" +
                (this.state.arrows.length +
                  1 +
                  this.state.arrowDeleteCount),
              rotation: copiedElement.rotation
            };

            let newName = this.state.selectedShapeName;

            this.setState(
              prevState => ({
                arrows: [...prevState.arrows, toPush]
              }),
              () => {
                this.setState({
                  selectedShapeName:
                    "arrow" + this.state.arrows.length
                });
              }
            );
          }
        } else if (copiedElement.name.includes("ellipse")) {
          length =
            this.state.ellipses.length +
            1 +
            this.state.ellipseDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            radiusX: copiedElement.radiusX,
            radiusY: copiedElement.radiusY,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "ellipse" +
              (this.state.ellipses.length +
                1 +
                this.state.ellipseDeleteCount),
            ref:
              "ellipse" +
              (this.state.ellipses.length +
                1 +
                this.state.ellipseDeleteCount),
            fill: copiedElement.fill,
            link: copiedElement.link,
            useImage: copiedElement.useImage,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              ellipses: [...prevState.ellipses, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName:
                  "ellipse" + this.state.ellipses.length
              });
            }
          );
        } else if (copiedElement.name.includes("image")) {
        length =
          this.state.images.length +
          1 +
          this.state.imageDeleteCount;
        var toPush = {
          x: copiedElement.x + 10,
          y: copiedElement.y + 10,
          width: copiedElement.width,
          height: copiedElement.height,
          imgsrc: copiedElement.imgsrc,
          stroke: copiedElement.stroke,
          strokeWidth: copiedElement.strokeWidth,
          id:
            "image" +
            (this.state.images.length +
              1 +
              this.state.imageDeleteCount),
          ref:
            "image" +
            (this.state.images.length +
              1 +
              this.state.imageDeleteCount),
          fill: copiedElement.fill,
          link: copiedElement.link,
          useImage: copiedElement.useImage,
          rotation: copiedElement.rotation
        };
        let newName = this.state.selectedShapeName;

        this.setState(
          prevState => ({
            images: [...prevState.images, toPush]
          }),
          () => {
            this.setState({
              selectedShapeName:
                "image" + this.state.images.length
            });
          }
        );
      } else if (copiedElement.name.includes("video")) {
      length =
        this.state.videos.length +
        1 +
        this.state.videoDeleteCount;
      var toPush = {
        x: copiedElement.x + 10,
        y: copiedElement.y + 10,
        width: copiedElement.width,
        height: copiedElement.height,
        vidsrc: copiedElement.vidsrc,
        stroke: copiedElement.stroke,
        strokeWidth: copiedElement.strokeWidth,
        id:
          "video" +
          (this.state.videos.length +
            1 +
            this.state.videoDeleteCount),
        ref:
          "video" +
          (this.state.videos.length +
            1 +
            this.state.videoDeleteCount),
        fill: copiedElement.fill,
        link: copiedElement.link,
        useImage: copiedElement.useImage,
        rotation: copiedElement.rotation
      };
      let newName = this.state.selectedShapeName;

      this.setState(
        prevState => ({
          videos: [...prevState.videos, toPush]
        }),
        () => {
          this.setState({
            selectedShapeName:
              "video" + this.state.videos.length
          });
        }
      );
    } else if (copiedElement.name.includes("audio")) {
    length =
      this.state.audios.length +
      1 +
      this.state.audioDeletedCount;
    var toPush = {
      x: copiedElement.x + 10,
      y: copiedElement.y + 10,
      width: copiedElement.width,
      height: copiedElement.height,
      audsrc: copiedElement.audsrc,
      stroke: copiedElement.stroke,
      strokeWidth: copiedElement.strokeWidth,
      id:
        "audio" +
        (this.state.audios.length +
          1 +
          this.state.audioDeletedCount),
      ref:
        "audio" +
        (this.state.audios.length +
          1 +
          this.state.audioDeletedCount),
      fill: copiedElement.fill,
      link: copiedElement.link,
      useImage: copiedElement.useImage,
      rotation: copiedElement.rotation
    };
    let newName = this.state.selectedShapeName;

    this.setState(
      prevState => ({
        audios: [...prevState.audios, toPush]
      }),
      () => {
        this.setState({
          selectedShapeName:
            "audio" + this.state.audios.length
        });
      }
    );
  } else if (copiedElement.name.includes("triangle")) {
      length =
        this.state.triangles.length +
        1 +
        this.state.triangleDeleteCount;
      var toPush = {
        x: copiedElement.x + 10,
        y: copiedElement.y + 10,
        width: copiedElement.width,
        height: copiedElement.height,
        sides: copiedElement.sides,
        radius: copiedElement.radius,
        stroke: copiedElement.stroke,
        strokeWidth: copiedElement.strokeWidth,
        id:
          "triangle" +
          (this.state.triangles.length +
            1 +
            this.state.triangleDeleteCount),
        ref:
          "triangle" +
          (this.state.triangles.length +
            1 +
            this.state.triangleDeleteCount),
        fill: copiedElement.fill,
        link: copiedElement.link,
        useImage: copiedElement.useImage,
        rotation: copiedElement.rotation
      };
      let newName = this.state.selectedShapeName;

      this.setState(
        prevState => ({
          triangles: [...prevState.triangles, toPush]
        }),
        () => {
          this.setState({
            selectedShapeName:
              "triangle" + this.state.triangles.length
          });
        }
      );
    } else if (copiedElement.name.includes("document")) {
        length =
          this.state.documents.length +
          1 +
          this.state.documentDeleteCount;
        var toPush = {
          x: copiedElement.x + 10,
          y: copiedElement.y + 10,
          width: copiedElement.width,
          height: copiedElement.height,
          sides: copiedElement.sides,
          radius: copiedElement.radius,
          stroke: copiedElement.stroke,
          strokeWidth: copiedElement.strokeWidth,
          id:
            "document" +
            (this.state.documents.length +
              1 +
              this.state.documentDeleteCount),
          ref:
            "document" +
            (this.state.documents.length +
              1 +
              this.state.documentDeleteCount),
          fill: copiedElement.fill,
          link: copiedElement.link,
          useImage: copiedElement.useImage,
          rotation: copiedElement.rotation
        };
        let newName = this.state.selectedShapeName;

        this.setState(
          prevState => ({
            documents: [...prevState.documents, toPush]
          }),
          () => {
            this.setState({
              selectedShapeName:
                "document" + this.state.documents.length
            });
          }
        );
      } else if (copiedElement.name.includes("line")) {
          length =
            this.state.lines.length +
            1 +
            this.state.linesDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            width: copiedElement.width,
            height: copiedElement.height,
            sides: copiedElement.sides,
            radius: copiedElement.radius,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "document" +
              (this.state.lines.length +
                1 +
                this.state.linesDeleteCount),
            ref:
              "line" +
              (this.state.lines.length +
                1 +
                this.state.linesDeleteCount),
            fill: copiedElement.fill,
            link: copiedElement.link,
            useImage: copiedElement.useImage,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              lines: [...prevState.lines, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName:
                  "line" + this.state.lines.length
              });
            }
          );
        } else if (copiedElement.name.includes("star")) {
          length =
            this.state.stars.length + 1 + this.state.starDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            link: copiedElement.link,
            innerRadius: copiedElement.innerRadius,
            outerRadius: copiedElement.outerRadius,
            stroke: copiedElement.stroke,
            strokeWidth: copiedElement.strokeWidth,
            id:
              "star" +
              (this.state.stars.length +
                1 +
                this.state.starDeleteCount),
            ref:
              "star" +
              (this.state.stars.length +
                1 +
                this.state.starDeleteCount),
            fill: copiedElement.fill,
            useImage: copiedElement.useImage,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              stars: [...prevState.stars, toPush]
            }),
            () => {
              this.setState({
                selectedShapeName: "star" + this.state.stars.length
              });
            }
          );
        } else if (copiedElement.name.includes("text")) {
          length =
            this.state.texts.length + 1 + this.state.textDeleteCount;
          var toPush = {
            x: copiedElement.x + 10,
            y: copiedElement.y + 10,
            link: copiedElement.link,

            id:
              "text" +
              (this.state.texts.length +
                1 +
                this.state.textDeleteCount),
            ref:
              "text" +
              (this.state.texts.length +
                1 +
                this.state.textDeleteCount),
            fill: copiedElement.fill,
            fontSize: copiedElement.fontSize,
            fontFamily: copiedElement.fontFamily,
            useImage: copiedElement.useImage,
            text: copiedElement.text,
            width: copiedElement.width,
            rotation: copiedElement.rotation
          };
          let newName = this.state.selectedShapeName;

          this.setState(
            prevState => ({
              texts: [...prevState.texts, toPush]
            }),
            () => {
              this.setState(
                {
                  selectedShapeName:
                    "text" +
                    (this.state.texts.length +
                      this.state.textDeleteCount)
                },
                () => {
                  console.log(this.state.selectedShapeName);
                }
              );
            }
          );
        }
      }
      this.setState({
        selectedContextMenu: false,
        selectedContextMenuText: false
      })
    }
  }

  handleDelete = () => {
    if (this.state.selectedShapeName !== "") {
      var that = this;
      //delete it from the state too
      let name = this.state.selectedShapeName;
      var rects = this.state.rectangles.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            rectDeleteCount: that.state.rectDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var ellipses = this.state.ellipses.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            ellipseDeleteCount: that.state.ellipseDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var triangles = this.state.triangles.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            triangleDeleteCount: that.state.triangleDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var images = this.state.images.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            imageDeleteCount: that.state.imageDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var lines = this.state.lines.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            linesDeleteCount: that.state.imageDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var videos = this.state.videos.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            videoDeleteCount: that.state.videoDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var audios = this.state.audios.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            audioDeletedCount: that.state.audioDeletedCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var documents = this.state.documents.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            documentDeletedCount: that.state.documentDeletedCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var stars = this.state.stars.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            starDeleteCount: that.state.starDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var arrows = this.state.arrows.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            arrowDeleteCount: that.state.arrowDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      var texts = this.state.texts.filter(function(eachRect) {
        if (eachRect.id === name) {
          that.setState({
            textDeleteCount: that.state.textDeleteCount + 1
          });
        }
        return eachRect.id !== name;
      });

      this.setState({
        rectangles: rects,
        ellipses: ellipses,
        triangles: triangles,
        images: images,
        videos: videos,
        audios: audios,
        documents: documents,
        stars: stars,
        arrows: arrows,
        texts: texts,
        lines: lines,
        selectedShapeName: ""
      });
      this.setState({
        selectedContextMenu: false,
        selectedContextMenuText: false
      })
    }
  }

  handleCut = () => {
    this.handleDelete();
    this.handleCopy();
    this.setState({
      selectedContextMenu: false,
      selectedContextMenuText: false
    })
  }

  handleClose = (e) => {
    this.setState({
      selectedContextMenu: false,
      selectedContextMenuText: false
    })
  }

  shapeIsGone = returnTo => {
    var toReturn = true;
    let currentShapeName = this.state.selectedShapeName;
    let [rectangles, ellipses, stars, arrows, texts, triangles, images, videos, audios, documents, lines] = [
      returnTo.rectangles,
      returnTo.ellipses,
      returnTo.stars,
      returnTo.arrows,
      returnTo.triangles,
      returnTo.images,
      returnTo.lines,
      returnTo.videos,
      returnTo.audios,
      returnTo.documents,

      returnTo.texts
    ];
    rectangles.map(eachRect => {
      if (eachRect.id === currentShapeName) {
        toReturn = false;
      }
    });
    ellipses.map(eachEllipse => {
      if (eachEllipse.id === currentShapeName) {
        toReturn = false;
      }
    });
    triangles.map(eachTriangle => {
      if (eachTriangle.id === currentShapeName) {
        toReturn = false;
      }
    });
    images.map(eachImage => {
      if (eachImage.id === currentShapeName) {
        toReturn = false;
      }
    });
    lines.map(eachLine => {
      if (eachLine.id === currentShapeName) {
        toReturn = false;
      }
    });
    videos.map(eachVideo => {
      if (eachVideo.id === currentShapeName) {
        toReturn = false;
      }
    });
    audios.map(eachAudio => {
      if (eachAudio.id === currentShapeName) {
        toReturn = false;
      }
    });
    documents.map(eachDocument => {
      if (eachDocument.id === currentShapeName) {
        toReturn = false;
      }
    });
    stars.map(eachStar => {
      if (eachStar.id === currentShapeName) {
        toReturn = false;
      }
    });
    arrows.map(eachArrow => {
      if (eachArrow.id === currentShapeName) {
        toReturn = false;
      }
    });

    texts.map(eachText => {
      if (eachText.id === currentShapeName) {
        toReturn = false;
      }
    });

    return toReturn;
  };
  IsJsonString = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  async componentDidMount() {
    history.push(this.state);
    this.setState({ selectedShapeName: "" });
    //if draft
  }
  addRectangle = () => {
    var rectName = this.state.rectangles.length + 1 + this.state.rectDeleteCount


    let name = 'rectangle' + rectName
    const rect = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 100,
      height:100,
      stroke: 'black',
      strokeWidth: 1.5,
      rotation: 0,
      ref: name,
      name: name,
      id: name,
      fill: this.state.colorf,
      useImage: false,
    };
    var layer = this.refs.layer2;
    var toPush = rect;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      rectangles: [...prevState.rectangles, toPush],
      selectedShapeName: toPush.name
    }));

  };

  addTriangle = () => {

    var triName = this.state.triangles.length + 1 + this.state.triangleDeleteCount

    let name = 'triangle' + triName
    const tri = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 100,
      height:100,
      sides: 3,
      radius: 70,
      stroke: 'black',
      strokeWidth: 1.5,
      rotation: 0,
      id: name,
      name: name,
      ref: name,
      fill: this.state.colorf,
      useImage: false
    };
    var layer = this.refs.layer2;
    var toPush = tri;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      triangles: [...prevState.triangles, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addImage = () => {
    var imgName = this.state.images.length + 1 + this.state.imageDeleteCount
    var imgsrc = this.state.imgsrc

    let name = 'image' + imgName
    const img = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 200,
      height: 200,
      imgsrc: imgsrc,
      stroke: 'black',
      strokeWidth: 1.5,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = img;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      images: [...prevState.images, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addVideo = () => {
    var vidName = this.state.videos.length + 1 + this.state.videoDeleteCount
    var vidsrc = this.state.vidsrc

    let name = 'video' + vidName
    const vid = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 600,
      y: 100,
      width: 400,
      height: 400,
      vidsrc: vidsrc,
      stroke: 'black',
      strokeWidth: 1.5,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = vid;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      videos: [...prevState.videos, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addAudio = () => {
    var audName = this.state.audios.length + 1 + this.state.audioDeletedCount
    var audsrc = this.state.audsrc


    let name = 'audio' + audName
    const aud = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 600,
      y: 100,
      width: 100,
      height: 100,
      imgsrc: "sound.png",
      audsrc: audsrc,
      stroke: 'black',
      strokeWidth: 0,
      opacity: 1,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = aud;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      audios: [...prevState.audios, toPush],
      selectedShapeName: toPush.name
    }));
  };

  addDocument = () => {
    var docName = this.state.documents.length + 1 + this.state.documentDeleteCount
    const bimage = new window.Image();
        bimage.onload = () => {
          this.setState({
            docimage: bimage
          })
        }
        bimage.src = 'downloadicon.png';
        bimage.width = 10;
        bimage.height = 10;
    let name = 'document' + docName
    const doc = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 100,
      height: 100,
      stroke: 'black',
      strokeWidth: 0,
      fillPatternImage: this.state.docimage,
      fillPatternOffset: "",
      rotation: 0,
      id: name,
      name: name,
      ref: name,
    };
    var layer = this.refs.layer2;
    var toPush = doc;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }
    this.setState(prevState => ({
      documents: [...prevState.documents, toPush],
      selectedShapeName: toPush.name
    }));

  };


  addCircle = () => {
    var circName = this.state.ellipses.length + 1 + this.state.ellipseDeleteCount

    let name = 'ellipse' + circName
    const circ = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      radiusX: 50,
      radiusY: 50,
      stroke: 'black',
      strokeWidth: 1.5,
      id: name,
      fill: this.state.colorf,
      ref: name,
      name: name,
      rotation: 0
    };
    var layer = this.refs.layer2;
    var toPush = circ;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      ellipses: [...prevState.ellipses, toPush],
      selectedShapeName: toPush.name
    }))
  };

  addStick = () => {

    var pos = this.refs.layer2
        .getStage()
        .getPointerPosition()
    var shape = this.refs.layer2.getIntersection(pos)


    let toPush = {
        rolelevel: this.state.rolelevel,
        infolevel: this.state.infolevel,
        level: this.state.level,
        visible: true,
        x: pos.x,
        y: pos.y,
        points: [20, 475, 60, 475],
        from: shape,
        stroke: 'black',
        strokeWidth: '1.5',
        fill: 'black'
    }

      if (toPush.from !== undefined) {
        //  console.log("we are making a connector");

        var transform = this.refs.layer2
          .getAbsoluteTransform()
          .copy();
        transform.invert();
        let uh = transform.point({
          x: toPush.x,
          y: toPush.y
        });
        toPush.x = uh.x;
        toPush.y = uh.y;

        var newArrow = {
          points: toPush.points,
          ref:
            "arrow" +
            (this.state.arrows.length +
              1 +
              this.state.arrowDeleteCount),
          name:
            "arrow" +
            (this.state.arrows.length +
              1 +
              this.state.arrowDeleteCount),
          from: toPush.from,
          stroke: toPush.stroke,
          strokeWidth: toPush.strokeWidth,
          fill: toPush.fill
        };

        //  console.log(newArrow);
        this.setState(prevState => ({
          arrows: [...prevState.arrows, newArrow],
          newArrowDropped: true,
          newArrowRef: newArrow.name,
          arrowEndX: toPush.x,
          arrowEndY: toPush.y
        }));
      } else {
        //  console.log("we are making just an aarrow");
        var transform = this.refs.layer2
          .getAbsoluteTransform()
          .copy();
        transform.invert();
        let uh = transform.point({
          x: toPush.x,
          y: toPush.y
        });
        toPush.x = uh.x;
        toPush.y = uh.y;
        var newArrow = {
          points: [toPush.x, toPush.y, toPush.x, toPush.y],
          ref:
            "arrow" +
            (this.state.arrows.length +
              1 +
              this.state.arrowDeleteCount),
          name:
            "arrow" +
            (this.state.arrows.length +
              1 +
              this.state.arrowDeleteCount),
          from: toPush.from,
          stroke: toPush.stroke,
          strokeWidth: toPush.strokeWidth,
          fill: toPush.fill
        };

        this.setState(prevState => ({
          arrows: [...prevState.arrows, newArrow],
          newArrowDropped: true,
          newArrowRef: newArrow.name,
          arrowEndX: toPush.x,
          arrowEndY: toPush.y
        }));
      }

      //this.refs updates after forceUpdate (because arrow gets instantiated), might be risky in the future
      //only this.state.arrows.length because it was pushed earlier, cancelling the +1
  }

  addStar = () => {
    var starName = this.state.stars.length + 1 + this.state.starDeleteCount

    let name = 'star' + starName
    const star = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 100,
      height: 100,
      numPoints: 5,
      innerRadius: 30,
      outerRadius: 70,
      stroke: 'black',
      strokeWidth: 1.5,
      id: name,
      name: name,
      fill: this.state.colorf,
      ref: name,
      rotation: 0
    };
    var layer = this.refs.layer2;
    var toPush = star;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });
    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      stars: [...prevState.stars, toPush],
      selectedShapeName: toPush.name
    }))
  };

  addText = () => {
    var textName = this.state.texts.length + 1 + this.state.textDeleteCount

    let name = 'text' + textName
    let ref = 'text' + textName
    const tex = {
      rolelevel: this.state.rolelevel,
      infolevel: this.state.infolevel,
      level: this.state.level,
      visible: true,
      x: 800,
      y: 400,
      width: 300,
      height: 25,
      fontSize: 50,
      text: "Edit this",
      fontFamily: "Belgrano",
      id: name,
      name: name,
      fill: this.state.colorf,
      opacity: 1,
      ref: ref,
      rotation: 0
    };

    var layer = this.refs.layer2;
    var toPush = tex;
    var transform = this.refs.layer2
      .getAbsoluteTransform()
      .copy();
    transform.invert();

    var pos = transform.point({
      x: toPush.x,
      y: toPush.y
    });

    if (layer.attrs.x !== null || layer.attrs.x !== undefined) {
      toPush.x = pos.x;
      toPush.y = pos.y;
    }

    this.setState(prevState => ({
      texts: [...prevState.texts, toPush]
    }));

    //we can also just get element by this.refs.toPush.ref

    //  let text = stage.findOne("." + toPush.name);

  }

  handleColorF = (e) =>{
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              fill: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              fill: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              fill: e.hex
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              fill: e.hex
            }
          : eachStar
      )
    }));
    this.setState(prevState => ({
      texts: prevState.texts.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              fill: e.hex
            }
          : eachStar
      )
    }));
  }
  handleFont = (e) => {
    this.setState(prevState => ({
      texts: prevState.texts.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              fontFamily: e
            }
          : eachRect
      )
    }));
  }
  handleSize = (e) => {
    this.setState(prevState => ({
      texts: prevState.texts.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
            fontSize  : e
            }
          : eachRect
      )
    }));
  }

  handleColorS = (e) => {
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              stroke: e.hex
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              stroke: e.hex
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              stroke: e.hex
            }
          : eachStar
      )
    }));

  }

  handleWidth = (e) =>{
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      documents: prevState.documents.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              strokeWidth: e/9
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              strokeWidth: e/9
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              strokeWidth: e/9
            }
          : eachStar
      )
    }));
  }

  handleOpacity = (e) => {
    this.setState(prevState => ({
      rectangles: prevState.rectangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      images: prevState.images.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      documents: prevState.documents.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      videos: prevState.videos.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      audios: prevState.audios.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      triangles: prevState.triangles.map(eachRect =>
        eachRect.id === this.state.selectedShapeName
          ? {
              ...eachRect,
              opacity: e
            }
          : eachRect
      )
    }));
    this.setState(prevState => ({
      ellipses: prevState.ellipses.map(eachCirc =>
        eachCirc.id === this.state.selectedShapeName
          ? {
              ...eachCirc,
              opacity: e
            }
          : eachCirc
      )
    }));
    this.setState(prevState => ({
      stars: prevState.stars.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              opacity: e
            }
          : eachStar
      )
    }));
    this.setState(prevState => ({
      texts: prevState.texts.map(eachStar =>
        eachStar.id === this.state.selectedShapeName
          ? {
              ...eachStar,
              opacity: e
            }
          : eachStar
      )
    }));
  }
  handleLevel = (e) => {
    this.setState({
      level: e
    }, this.handleLevelUpdate)
  }

  handleLayerClear = () => {
    this.refs.layer2.clear();
  }
  handleLayerDraw = () => {
    console.log(this.state.rectangles)
  }
  handleImage = (e) => {
    this.setState({
      imgsrc: e
    })
    console.log(e)
  }
  handleVideo = (e) => {
    this.setState({
      vidsrc: e
    })
    console.log(e)
  }
  handleAudio = (e) => {
    this.setState({
      audsrc: e
    })
    console.log(e)
  }
  handleDocument = (e) => {
    this.setState({
      docsrc: e
    })
    console.log(e)
  }
  handleDownload = (url, filename) => {
  axios.get(url, {
    responseType: 'blob',
  })
  .then((res) => {
    fileDownload(res.data, filename)
    console.log(res)
  })
  console.log(8)
}

  drawLine = () => {
    this.setState({
      drawMode: true
    })
    this.setState({
      tool: "pen"
    })

  };
  stopDrawing = () => {
    console.log(this.refs.layer2)
    this.setState({
      drawMode: false
    })
  }
  chooseColor = (e) => {
    this.setState({
      color: e.hex
    })
  }
  editMode = () => {
    console.log(4)
    this.setState({
      infolevel: true
    })
  }
  editModeOff = () => {
    this.setState({
      infolevel: false
    })
  }
  handleRoleLevel = (e) => {
    this.setState({
      rolelevel: e
    })

  }




  render() {
    let saveText;

    let saving = this.state.saving;
    if (saving !== null) {
      if (saving) {
        saveText = <div style={{ color: "white" }}>Saving</div>;
      } else {
        saveText = <div style={{ color: "white" }}>Saved</div>;
      }
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    var gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0.0, "red");
    gradient.addColorStop(1 / 6, "orange");
    gradient.addColorStop(2 / 6, "yellow");
    gradient.addColorStop(3 / 6, "green");
    gradient.addColorStop(4 / 6, "aqua");
    gradient.addColorStop(5 / 6, "blue");
    gradient.addColorStop(1.0, "purple");

    const errMsg = this.state.errMsg;
    let errDisplay;
    if (errMsg !== "") {
      errDisplay = (
        <div className="errMsginner">
          <span style={{ color: "white" }}>
            {errMsg !== "" ? errMsg : null}
          </span>
        </div>
      );
    } else {
    }


    return (
      <React.Fragment>
        <Timer handleSave={this.handleSave} />
        <div
          onKeyDown={event => {
            const x = 88,
              deleteKey = 46,
              copy = 67,
              paste = 86,
              z = 90,
              y = 89;
            if (event.ctrlKey && event.keyCode === x && !this.state.isPasteDisabled) {
                this.handleDelete();
                this.handleCopy();
            } else if (event.keyCode === deleteKey  && !this.state.isPasteDisabled) {
              this.handleDelete();
            } else if (event.shiftKey && event.ctrlKey && event.keyCode === z) {
              this.handleRedo();
            } else if (event.ctrlKey && event.keyCode === z) {
              this.handleUndo();
            } else if (event.ctrlKey && event.keyCode === y) {
              this.handleRedo();
            } else if (event.ctrlKey && event.keyCode === copy) {
              this.handleCopy();
            } else if (event.ctrlKey && event.keyCode === paste && !this.state.isPasteDisabled) {
              this.handlePaste();
            } else if (event.ctrlKey) {
              this.setState({
                draggable: true
              })
            }}}
          tabIndex="0"
          style={{ outline: "none" }}
        >
          <Stage
            onClick={this.handleStageClick}
            draggabble
            onMouseMove={this.handleMouseOver}
            onWheel={event => this.handleWheel(event)}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.handleMouseUp}
            height={window.innerHeight}
            width={window.innerWidth}
            ref="graphicStage"
          >
            <Layer
              scaleX={this.state.layerScale}
              scaleY={this.state.layerScale}
              x={this.state.layerX}
              y={this.state.layerY}
              height={window.innerHeight}
              width={window.innerWidth}
              draggable={this.state.draggable}
              onDragEnd={() => {
                this.setState({
                  layerX: this.refs.layer2.x(),
                  layerY: this.refs.layer2.y()
                });
              }}
              ref="layer2"
            >
              <Rect
                x={-5 * window.innerWidth}
                y={-5 * window.innerHeight}
                height={window.innerHeight * 10}
                width={window.innerWidth * 10}
                name=""
                id="ContainerRect"
              />




            {this.state.rectangles.map(eachRect => {
              if(eachRect.level === this.state.level && eachRect.infolevel === false)
                return (
                  <Rect
                  visible={eachRect.visible}
                  rotation={eachRect.rotation}
                  ref={eachRect.ref}
                  fill={eachRect.fill}
                  fillPatternImage={eachRect.fillPatternImage}
                  fillPatternOffset={eachRect.fillPatternOffset}
                  image={eachRect.image}
                  opacity={eachRect.opacity}
                  id={eachRect.id}
                  name="shape"
                  x={eachRect.x}
                  y={eachRect.y}
                  width={eachRect.width}
                  height={eachRect.height}
                  stroke={eachRect.stroke}
                  strokeWidth={eachRect.strokeWidth}
                  strokeScaleEnabled={false}
                  draggable
                    onClick={() => {
                      var that = this;
                      if (eachRect.link !== undefined && eachRect.link !== "") {
                        this.setState(
                          {
                            errMsg: "Links will not be opened in create mode"
                          },
                          () => {
                            setTimeout(function() {
                              that.setState({
                                errMsg: ""
                              });
                            }, 1000);
                          }
                        );
                      }
                    }}
                    onTransformStart={() => {
                      this.setState({
                        isTransforming: true
                      });
                      let rect = this.refs[eachRect.ref];
                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransform={() => {
                      let rect = this.refs[eachRect.ref];

                      if (rect.attrs.lastRotation !== rect.rotation()) {
                        this.state.arrows.map(eachArrow => {
                          if (
                            eachArrow.to &&
                            eachArrow.to.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up!"
                            });
                          }
                          if (
                            eachArrow.from &&
                            eachArrow.from.name() === rect.name()
                          ) {
                            this.setState({
                              errMsg:
                                "Rotating rects with connectors might skew things up!"
                            });
                          }
                        });
                      }

                      rect.setAttr("lastRotation", rect.rotation());
                    }}
                    onTransformEnd={() => {
                      this.setState({
                        isTransforming: false
                      });

                      let rect = this.refs[eachRect.ref];

                      this.setState(
                        prevState => ({
                          errMsg: "",
                          rectangles: prevState.rectangles.map(eachRect =>
                            eachRect.id === rect.attrs.id
                              ? {
                                  ...eachRect,
                                  width: rect.width() * rect.scaleX(),
                                  height: rect.height() * rect.scaleY(),
                                  rotation: rect.rotation(),
                                  x: rect.x(),
                                  y: rect.y(),

                                }
                              : eachRect
                          )
                        }),
                        () => {
                          this.forceUpdate();
                        }
                      );

                      rect.setAttr("scaleX", 1);
                      rect.setAttr("scaleY", 1);
                    }}

                    onDragMove={() => {
                      this.state.arrows.map(eachArrow => {
                        if (eachArrow.from !== undefined) {
                          if (eachRect.name === eachArrow.from.attrs.name) {
                            eachArrow.points = [
                              eachRect.x,
                              eachRect.y,
                              eachArrow.points[2],
                              eachArrow.points[3]
                            ];
                            this.forceUpdate();
                          }
                        }

                        if (eachArrow.to !== undefined) {
                          if (eachRect.name === eachArrow.to.attrs.name) {
                            eachArrow.points = [
                              eachArrow.points[0],
                              eachArrow.points[1],
                              eachRect.x,
                              eachRect.y
                            ];
                            this.forceUpdate();
                          }
                        }
                      });
                    }}
                    onDragEnd={event => {
                      //cannot compare by name because currentSelected might not be the same
                      //have to use ref, which appears to be overcomplicated
                      var shape = this.refs[eachRect.ref];
                      /*    this.state.rectangles.map(eachRect => {
                          if (eachRect.name === shape.attrs.name) {
                            shape.position({
                              x: event.target.x(),
                              y: event.target.y()
                            });
                          }
                        });*/

                      this.setState(prevState => ({
                        rectangles: prevState.rectangles.map(eachRect =>
                          eachRect.id === shape.attrs.id
                            ? {
                                ...eachRect,
                                x: event.target.x(),
                                y: event.target.y(),
                              }
                            : eachRect
                        )
                      }));
                    }}
                    onContextMenu={e => {

                      e.evt.preventDefault(true);
                      const mousePosition = e.target.getStage().getPointerPosition();

                      this.setState({
                        selectedContextMenu: {
                          type: "START",
                          position: mousePosition
                        }
                      });
                    }
                    }

                  />
                );
              })}
              {this.state.selectedContextMenu && (
                <Portal>
              <ContextMenu
                {...this.state.selectedContextMenu}
                selectedshape={this.state.selectedShapeName}
                onOptionSelected={this.handleOptionSelected}
                choosecolors={this.handleColorS}
                choosecolorf={this.handleColorF}
                handleWidth={this.handleWidth}
                handleOpacity={this.handleOpacity}
                close={this.handleClose}
                copy={this.handleCopy}
                cut={this.handleCut}
                paste={this.handlePaste}
                delete={this.handleDelete}
              />
              </Portal>
            )}

              {this.state.ellipses.map(eachEllipse => {
                if(eachEllipse.level === this.state.level && eachEllipse.infolevel === false)
                return (
                <Ellipse
                  visible={eachEllipse.visible}
                  ref={eachEllipse.ref}
                  name="shape"
                  id={eachEllipse.id}
                  x={eachEllipse.x}
                  y={eachEllipse.y}
                  opacity={eachEllipse.opacity}
                  rotation={eachEllipse.rotation}
                  radiusX={eachEllipse.radiusX}
                  radiusY={eachEllipse.radiusY}
                  fill={eachEllipse.fill}
                  stroke={eachEllipse.stroke}
                  strokeWidth={eachEllipse.strokeWidth}
                  strokeScaleEnabled={false}
                  onClick={() => {
                    var that = this;
                    if (
                      eachEllipse.link !== undefined &&
                      eachEllipse.link !== ""
                    ) {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                    let ellipse = this.refs[eachEllipse.ref];
                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransform={() => {
                    let ellipse = this.refs[eachEllipse.ref];

                    if (ellipse.attrs.lastRotation !== ellipse.rotation()) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === ellipse.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    ellipse.setAttr("lastRotation", ellipse.rotation());
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let ellipse = this.refs[eachEllipse.ref];
                    let scaleX = ellipse.scaleX(),
                      scaleY = ellipse.scaleY();

                    this.setState(prevState => ({
                      errMsg: "",
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.id === ellipse.attrs.id
                          ? {
                              ...eachEllipse,

                              radiusX: ellipse.radiusX() * ellipse.scaleX(),
                              radiusY: ellipse.radiusY() * ellipse.scaleY(),
                              rotation: ellipse.rotation(),
                              x: ellipse.x(),
                              y: ellipse.y()
                            }
                          : eachEllipse
                      )
                    }));

                    ellipse.setAttr("scaleX", 1);
                    ellipse.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        console.log("prevArrow: ", eachArrow.points);
                        if (eachEllipse.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachEllipse.x,
                            eachEllipse.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();

                          this.refs.graphicStage.draw();
                        }
                        console.log("new arrows:", eachArrow.points);
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachEllipse.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachEllipse.x,
                            eachEllipse.y
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachEllipse.ref];

                    this.setState(prevState => ({
                      ellipses: prevState.ellipses.map(eachEllipse =>
                        eachEllipse.id === shape.attrs.id
                          ? {
                              ...eachEllipse,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachEllipse
                      )
                    }));

                    this.refs.graphicStage.draw();
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
              );
            })}
              {this.state.lines.map((eachLine, i) => {
                if(eachLine.level === this.state.level && eachLine.infolevel === false)
                return(
                  <Line
                    id={eachLine.id}
                    level={eachLine.level}
                    key={i}
                    points={eachLine.points}
                    stroke={eachLine.color}
                    strokeWidth={5}
                    tension={0.5}
                    lineCap="round"
                    globalCompositeOperation={
                      eachLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                    }
                    draggable
                    onContextMenu={e => {

                      e.evt.preventDefault(true);
                      const mousePosition = e.target.getStage().getPointerPosition();

                      this.setState({
                        selectedContextMenu: {
                          type: "START",
                          position: mousePosition
                        }
                      });
                    }
                    }
                  />
              );
              })}

              {this.state.images.map(eachImage => {
                if(eachImage.level === this.state.level && eachImage.infolevel === false)
                return (
                <URLImage
                  visible={eachImage.visible}
                  src={eachImage.imgsrc}
                  image={eachImage.imgsrc}
                  ref={eachImage.ref}
                  name="shape"
                  id={eachImage.id}
                  layer={this.refs.layer2}
                  x={eachImage.x}
                  y={eachImage.y}
                  width={eachImage.width}
                  height={eachImage.height}
                  stroke={eachImage.stroke}
                  strokeWidth={eachImage.strokeWidth}
                  rotation={eachImage.rotation}
                  opacity={eachImage.opacity}
                  onClick={() => {
                    var that = this;
                    if (eachImage.link !== undefined && eachImage.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachImage.ref];

                }}

                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachImage.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachImage.x,
                            eachImage.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachImage.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachImage.x,
                            eachImage.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachImage.ref];
                    /*    this.state.rectangles.map(eachRect => {
                        if (eachRect.name === shape.attrs.name) {
                          shape.position({
                            x: event.target.x(),
                            y: event.target.y()
                          });
                        }
                      });*/
                      console.log(this.refs)

                    this.setState(prevState => ({
                      images: prevState.images.map(eachRect =>
                        eachRect.id === shape.props.id
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));

                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
            );
            })}
              {this.state.videos.map(eachVideo => {
                if(eachVideo.level === this.state.level && eachVideo.infolevel === false)
                return (
                <URLvideo
                  visible={eachVideo.visible}
                  src={eachVideo.vidsrc}
                  image={eachVideo.vidsrc}
                  ref={eachVideo.ref}
                  id={eachVideo.id}
                  name="shape"
                  layer={this.refs.layer2}
                  x={eachVideo.x}
                  y={eachVideo.y}
                  width={eachVideo.width}
                  height={eachVideo.height}
                  stroke={eachVideo.stroke}
                  strokeWidth={eachVideo.strokeWidth}
                  rotation={eachVideo.rotation}
                  opacity={eachVideo.opacity}
                  onClick={() => {
                    var that = this;
                    if (eachVideo.link !== undefined && eachVideo.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachVideo.ref];

                }}

                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachVideo.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachVideo.x,
                            eachVideo.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachVideo.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachVideo.x,
                            eachVideo.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    console.log(this.state.videos)
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachVideo.ref];
                    this.setState(prevState => ({
                      videos: prevState.videos.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
            );
            })}
              {this.state.audios.map(eachAudio => {
                if(eachAudio.level === this.state.level && eachAudio.infolevel === false)
                return (
                <URLvideo
                  visible={eachAudio.visible}
                  fillPatternImage={true}
                  src={eachAudio.audsrc}
                  image={eachAudio.imgsrc}
                  ref={eachAudio.ref}
                  id={eachAudio.id}
                  name="shape"
                  layer={this.refs.layer2}
                  x={eachAudio.x}
                  y={eachAudio.y}
                  width={eachAudio.width}
                  height={eachAudio.height}
                  stroke={eachAudio.stroke}
                  strokeWidth={eachAudio.strokeWidth}
                  rotation={eachAudio.rotation}
                  opacity={eachAudio.opacity}
                  onClick={() => {

                    var that = this;
                    if (eachAudio.link !== undefined && eachAudio.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachAudio.ref];

                }}

                  onDragMove={() => {

                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachAudio.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachAudio.x,
                            eachAudio.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachAudio.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachAudio.x,
                            eachAudio.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachAudio.ref];



                    this.setState(prevState => ({
                      videos: prevState.videos.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
            );
            })}
              {this.state.documents.map(eachDoc => {
                if(eachDoc.level === this.state.level && eachDoc.infolevel === false)
                return (
                <Rect
                  rotation={eachDoc.rotation}
                  ref={eachDoc.ref}
                  fill={eachDoc.fill}
                  fillPatternImage={this.state.docimage}
                  fillPatternOffset={eachDoc.fillPatternOffset}
                  fillPatternScaleY={0.2}
                  fillPatternScaleX={0.2}
                  image={eachDoc.image}
                  opacity={eachDoc.opacity}
                  id={eachDoc.id}
                  name="shape"
                  x={eachDoc.x}
                  y={eachDoc.y}
                  width={eachDoc.width}
                  height={eachDoc.height}
                  stroke={eachDoc.stroke}
                  strokeWidth={eachDoc.strokeWidth}
                  onClick={() => {
                    console.log(this.state.docsrc)
                    fetch(this.state.docsrc, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/pdf',
                        },
                      })
                      .then((response) => response.blob())
                      .then((blob) => {
                        console.log(blob)

                        // Create blob link to download
                        const url = window.URL.createObjectURL(
                          new Blob([blob]),
                        );
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute(
                          'download',
                          this.state.docsrc,
                        );

                        // Append to html link element page
                        document.body.appendChild(link);

                        // Start download
                        link.click();

                        // Clean up and remove the link
                        link.parentNode.removeChild(link);
                      });
                    }}
                  onTransformStart={() => {
                    this.setState({
                      isTransforming: true
                    });

                  }}
                  onTransform={() => {

                  }}
                  onTransformEnd={() => {
                    this.setState({
                      isTransforming: false
                    });
                    let triangle = this.refs[eachDoc.ref];

                }}
                draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachDoc.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachDoc.x,
                            eachDoc.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachDoc.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachDoc.x,
                            eachDoc.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {

                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachDoc.ref];
                    /*    this.state.rectangles.map(eachRect => {
                        if (eachRect.name === shape.attrs.name) {
                          shape.position({
                            x: event.target.x(),
                            y: event.target.y()
                          });
                        }
                      });*/


                    this.setState(prevState => ({
                      documents: prevState.documents.map(eachRect =>
                        eachRect.id === this.state.currentSelected
                          ? {
                              ...eachRect,
                              x: event.target.x(),
                              y: event.target.y(),
                            }
                          : eachRect
                      )
                    }));
                  }}
                  onContextMenu={e => {

                    e.evt.preventDefault(true);
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }

                />
            );
            })}
              {this.state.triangles.map(eachEllipse => {
                if(eachEllipse.level === this.state.level && eachEllipse.infolevel === false)
                return (
                <RegularPolygon
                  visible={eachEllipse.visible}
                  ref={eachEllipse.ref}
                  id={eachEllipse.id}
                  name="shape"
                  x={eachEllipse.x}
                  y={eachEllipse.y}
                  opacity={eachEllipse.opacity}
                  rotation={eachEllipse.rotation}
                  height={eachEllipse.height}
                  sides={eachEllipse.sides}
                  radius={eachEllipse.radius}
                  fill={eachEllipse.fill}
                  stroke={eachEllipse.stroke}
                  strokeWidth={eachEllipse.strokeWidth}
                  strokeScaleEnabled={false}
                  onClick={() => {
                    var that = this;
                    if (
                      eachEllipse.link !== undefined &&
                      eachEllipse.link !== ""
                    ) {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                    let triangle = this.refs[eachEllipse.ref];
                    triangle.setAttr("lastRotation", triangle.rotation());
                  }}
                  onTransform={() => {
                    let triangle = this.refs[eachEllipse.ref];

                    if (triangle.attrs.lastRotation !== triangle.rotation()) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === triangle.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === triangle.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating ellipses with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    triangle.setAttr("lastRotation", triangle.rotation());
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let triangle = this.refs[eachEllipse.ref];
                    let scaleX = triangle.scaleX(),
                        scaleY = triangle.scaleY();

                    this.setState(prevState => ({
                      errMsg: "",
                      triangles: prevState.triangles.map(eachEllipse =>
                        eachEllipse.id === triangle.attrs.id
                          ? {
                              ...eachEllipse,

                              width: triangle.width() * triangle.scaleX(),
                              height: triangle.height() * triangle.scaleY(),
                              rotation: triangle.rotation(),
                              x: triangle.x(),
                              y: triangle.y()
                            }
                          : eachEllipse
                      )
                    }));

                    triangle.setAttr("scaleX", 1);
                    triangle.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        console.log("prevArrow: ", eachArrow.points);
                        if (eachEllipse.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachEllipse.x,
                            eachEllipse.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                        console.log("new arrows:", eachArrow.points);
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachEllipse.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachEllipse.x,
                            eachEllipse.y
                          ];
                          this.forceUpdate();
                          this.refs.graphicStage.draw();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachEllipse.ref];

                    this.setState(prevState => ({
                      triangles: prevState.triangles.map(eachEllipse =>
                        eachEllipse.id === shape.attrs.id
                          ? {
                              ...eachEllipse,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachEllipse
                      )
                    }));

                    this.refs.graphicStage.draw();
                  }}
                  onContextMenu={e => {
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
            );
            })}
              {this.state.stars.map(eachStar => {
                if(eachStar.level === this.state.level && eachStar.infolevel === false)
                return (
                <Star
                  visible={eachStar.visible}
                  ref={eachStar.ref}
                  id={eachStar.id}
                  name="shape"
                  x={eachStar.x}
                  y={eachStar.y}
                  innerRadius={eachStar.innerRadius}
                  outerRadius={eachStar.outerRadius}
                  numPoints={eachStar.numPoints}
                  stroke={eachStar.stroke}
                  strokeWidth={eachStar.strokeWidth}
                  fill={eachStar.fill}
                  opacity={eachStar.opacity}
                  strokeScaleEnabled={false}
                  rotation={eachStar.rotation}
                  onClick={() => {
                    var that = this;
                    if (eachStar.link !== undefined && eachStar.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );
                    }
                  }}
                  onTransformStart={() => {
                    this.setState({ isTransforming: true });
                  }}
                  onTransformEnd={() => {
                    this.setState({ isTransforming: false });
                    let star = this.refs[eachStar.ref];
                    let scaleX = star.scaleX(),
                      scaleY = star.scaleY();

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.id === star.attrs.id
                          ? {
                              ...eachStar,
                              innerRadius: star.innerRadius() * star.scaleX(),
                              outerRadius: star.outerRadius() * star.scaleX(),
                              rotation: star.rotation(),
                              x: star.x(),
                              y: star.y()
                            }
                          : eachStar
                      )
                    }));
                    star.setAttr("scaleX", 1);
                    star.setAttr("scaleY", 1);
                    this.forceUpdate();
                  }}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachStar.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachStar.x,
                            eachStar.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachStar.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachStar.x,
                            eachStar.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachStar.ref];

                    this.setState(prevState => ({
                      stars: prevState.stars.map(eachStar =>
                        eachStar.id === shape.attrs.id
                          ? {
                              ...eachStar,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachStar
                      )
                    }));
                  }}
                  onContextMenu={e => {
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenu: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
                />
            );
            })}

              {this.state.texts.map(eachText => {
                if(eachText.level === this.state.level && eachText.infolevel === false)
                return (
                //perhaps this.state.texts only need to contain refs?
                //so that we only need to store the refs to get more information
                <Text
                  visible={eachText.visible}
                  textDecoration={eachText.link ? "underline" : ""}
                  onTransformStart={() => {
                    var currentText = this.refs[this.state.selectedShapeName];
                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransform={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    currentText.setAttr(
                      "width",
                      currentText.width() * currentText.scaleX()
                    );
                    currentText.setAttr("scaleX", 1);

                    currentText.draw();

                    if (
                      currentText.attrs.lastRotation !== currentText.rotation()
                    ) {
                      this.state.arrows.map(eachArrow => {
                        if (
                          eachArrow.to &&
                          eachArrow.to.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up!"
                          });
                        }
                        if (
                          eachArrow.from &&
                          eachArrow.from.name() === currentText.name()
                        ) {
                          this.setState({
                            errMsg:
                              "Rotating texts with connectors might skew things up!"
                          });
                        }
                      });
                    }

                    currentText.setAttr("lastRotation", currentText.rotation());
                  }}
                  onTransformEnd={() => {
                    var currentText = this.refs[this.state.selectedShapeName];

                    this.setState(prevState => ({
                      errMsg: "",
                      texts: prevState.texts.map(eachText =>
                        eachText.id === this.state.selectedShapeName
                          ? {
                              ...eachText,
                              width: currentText.width(),
                              rotation: currentText.rotation(),
                              textWidth: currentText.textWidth,
                              textHeight: currentText.textHeight,
                              x: currentText.x(),
                              y: currentText.y()
                            }
                          : eachText
                      )
                    }));
                    currentText.setAttr("scaleX", 1);
                    currentText.draw();
                  }}
                  link={eachText.link}
                  width={eachText.width}
                  fill={eachText.fill}
                  opacity={eachText.opacity}
                  id={eachText.id}
                  name="shape"
                  ref={eachText.ref}
                  rotation={eachText.rotation}
                  fontFamily={eachText.fontFamily}
                  fontSize={eachText.fontSize}
                  x={eachText.x}
                  y={eachText.y}
                  text={eachText.text}
                  draggable
                  onDragMove={() => {
                    this.state.arrows.map(eachArrow => {
                      if (eachArrow.from !== undefined) {
                        if (eachText.name === eachArrow.from.attrs.name) {
                          eachArrow.points = [
                            eachText.x,
                            eachText.y,
                            eachArrow.points[2],
                            eachArrow.points[3]
                          ];
                          this.forceUpdate();
                        }
                      }

                      if (eachArrow.to !== undefined) {
                        if (eachText.name === eachArrow.to.attrs.name) {
                          eachArrow.points = [
                            eachArrow.points[0],
                            eachArrow.points[1],
                            eachText.x,
                            eachText.y
                          ];
                          this.forceUpdate();
                        }
                      }
                    });
                  }}
                  onDragEnd={event => {
                    //cannot compare by name because currentSelected might not be the same
                    //have to use ref, which appears to be overcomplicated
                    var shape = this.refs[eachText.ref];

                    this.setState(prevState => ({
                      texts: prevState.texts.map(eachtext =>
                        eachtext.id === shape.attrs.id
                          ? {
                              ...eachtext,
                              x: event.target.x(),
                              y: event.target.y()
                            }
                          : eachtext
                      )
                    }));
                  }}
                  onClick={() => {
                    var that = this;
                    if (eachText.link !== undefined && eachText.link !== "") {
                      this.setState(
                        {
                          errMsg: "Links will not be opened in create mode"
                        },
                        () => {
                          setTimeout(function() {
                            that.setState({
                              errMsg: ""
                            });
                          }, 1000);
                        }
                      );

                      //var win = window.open(eachText.link, "_blank");
                      //win.focus();
                    }
                  }}
                  onDblClick={() => {
                    // turn into textarea
                    var stage = this.refs.graphicStage;
                    let text = this.refs[eachText.ref];
                    console.log(text)


                    this.setState({
                      textX: text.absolutePosition().x,
                      textY: text.absolutePosition().y,
                      textEditVisible: !this.state.textEditVisible,
                      text: eachText.text,
                      textNode: eachText,
                      currentTextRef: eachText.ref,
                      textareaWidth: text.textWidth,
                      textareaHeight: text.textHeight,
                      textareaFill: text.attrs.fill,
                      textareaFontFamily: text.attrs.fontFamily,
                      textareaFontSize: text.attrs.fontSize
                    });
                    let textarea = this.refs.textarea;
                    textarea.focus();
                    text.hide();
                    var transformer = stage.findOne(".transformer");
                    transformer.hide();
                    this.refs.layer2.draw();
                  }}
                  onContextMenu={e => {
                    e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                    const mousePosition = e.target.getStage().getPointerPosition();

                    this.setState({
                      selectedContextMenuText: {
                        type: "START",
                        position: mousePosition
                      }
                    });
                  }
                  }
              />
            );
            })}
            {this.state.selectedContextMenuText && (
              <Portal>
            <ContextMenuText
              {...this.state.selectedContextMenuText}
              selectedshape={this.state.selectedShapeName}
              onOptionSelected={this.handleOptionSelected}
              choosecolorf={this.handleColorF}
              handleFont={this.handleFont}
              handleSize={this.handleSize}
              handleOpacity={this.handleOpacity}
              close={this.handleClose}
              copy={this.handleCopy}
              cut={this.handleCut}
              paste={this.handlePaste}
              delete={this.handleDelete}
            />
            </Portal>
          )}
              {this.state.arrows.map(eachArrow => {
                if (!eachArrow.from && !eachArrow.to && eachArrow.level === this.state.level && eachArrow.infolevel === false) {
                  return (
                    <Arrow
                      visible={eachArrow.visible}
                      ref={eachArrow.ref}
                      id={eachArrow.id}
                      name="shape"
                      points={[
                        eachArrow.points[0],
                        eachArrow.points[1],
                        eachArrow.points[2],
                        eachArrow.points[3]
                      ]}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                      draggable
                      onDragEnd={event => {
                        //set new points to current position

                        //usually: state => star => x & y
                        //now: state => arrow => attr => x & y

                        let oldPoints = [
                          eachArrow.points[0],
                          eachArrow.points[1],
                          eachArrow.points[2],
                          eachArrow.points[3]
                        ];

                        let shiftX = this.refs[eachArrow.ref].attrs.x;
                        let shiftY = this.refs[eachArrow.ref].attrs.y;

                        let newPoints = [
                          oldPoints[0] + shiftX,
                          oldPoints[1] + shiftY,
                          oldPoints[2] + shiftX,
                          oldPoints[3] + shiftY
                        ];

                        this.refs[eachArrow.ref].position({ x: 0, y: 0 });
                        this.refs.layer2.draw();

                        this.setState(prevState => ({
                          arrows: prevState.arrows.map(eachArr =>
                            eachArr.name === eachArrow.name
                              ? {
                                  ...eachArr,
                                  points: newPoints
                                }
                              : eachArr
                          )
                        }));
                      }}
                    />
                  );
                } else if (
                  eachArrow.name === this.state.newArrowRef &&
                  (eachArrow.from || eachArrow.to)
                ) {
                  return (
                    <Connector
                      id={eachArrow.id}
                      name="shape"
                      from={eachArrow.from}
                      to={eachArrow.to}
                      arrowEndX={this.state.arrowEndX}
                      arrowEndY={this.state.arrowEndY}
                      current={true}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                    />
                  );
                } else if (eachArrow.from || eachArrow.to) {
                  //if arrow construction is completed
                  return (
                    <Connector
                      id={eachArrow.id}
                      name="shape"
                      from={eachArrow.from}
                      to={eachArrow.to}
                      points={eachArrow.points}
                      current={false}
                      stroke={eachArrow.stroke}
                      fill={eachArrow.fill}
                    />
                  );
                }
              })}
              <TransformerComponent
                  selectedShapeName={this.state.selectedShapeName}
                  ref="trRef"

                  boundBoxFunc={(oldBox, newBox) => {
                      // limit resize
                      if (newBox.width < 5 || newBox.height < 5) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                />
              <Rect fill="rgba(0,0,0,0.5)" ref="selectionRectRef" />
            </Layer>
          </Stage>

          <textarea
            ref="textarea"
            id="textarea"
            value={this.state.text}
            onChange={e => {
              this.setState({
                text: e.target.value,
                shouldTextUpdate: false
              });
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.setState({
                  textEditVisible: false,
                  shouldTextUpdate: true
                });

                // get the current textNode we are editing, get the name from there
                //match name with elements in this.state.texts,
                let node = this.refs[this.state.currentTextRef];
                console.log("node width before set", node.textWidth);
                let name = node.attrs.name;
                this.setState(
                  prevState => ({
                    selectedShapeName: name,
                    texts: prevState.texts.map(eachText =>
                      eachText.name === name
                        ? {
                            ...eachText,
                            text: this.state.text
                          }
                        : eachText
                    )
                  }),
                  () => {
                    this.setState(prevState => ({
                      texts: prevState.texts.map(eachText =>
                        eachText.name === name
                          ? {
                              ...eachText,
                              textWidth: node.textWidth,
                              textHeight: node.textHeight
                            }
                          : eachText
                      )
                    }));
                  }
                );

                node.show();
                this.refs.graphicStage.findOne(".transformer").show();
              }
            }}
            onBlur={() => {
              console.log(this.state.textareaFontSize)
              this.setState({
                textEditVisible: false,
                shouldTextUpdate: true
              });

              // get the current textNode we are editing, get the name from there
              //match name with elements in this.state.texts,

              console.log(this.state.currentTextRef)
              let node = this.refs[this.state.currentTextRef];

              let name = node.attrs.id;
              console.log(name)
              console.log(this.state.selectedShapeName)
              this.setState(
                prevState => ({
                  selectedShapeName: name,
                  texts: prevState.texts.map(eachText =>
                    eachText.id === name
                      ? {
                          ...eachText,
                          text: this.state.text
                        }
                      : eachText
                  )
                }),
                () => {
                  this.setState(prevState => ({
                    texts: prevState.texts.map(eachText =>
                      eachText.name === name
                        ? {
                            ...eachText,
                            textWidth: node.textWidth,
                            textHeight: node.textHeight
                          }
                        : eachText
                    )
                  }));
                }
              );
              node.show();
              this.refs.graphicStage.findOne(".transformer").show();
              this.refs.graphicStage.draw();
            }}
            style={{
              //set position, width, height, fontSize, overflow, lineHeight, color
              display: this.state.textEditVisible ? "block" : "none",
              position: "absolute",
              top: this.state.textY + 80 + "px",
              left: this.state.textX + "px",
              width: this.state.textareaWidth,
              height: this.state.textareaHeight,
              fontSize: this.state.textareaFontSize,
              fontFamily: this.state.textareaFontFamily,
              color: this.state.textareaFill,
              border: "none",
              padding: "0px",
              margin: "0px",
              outline: "none",
              resize: "none",
              background: "none"
            }}
          />
          <div className="errMsg">{errDisplay}</div>
        </div>
        <div className="eheader">
        <Level number={this.state.pageNumber} ptype={this.state.ptype} level={this.handleLevel}/>
          <h1 id="editmode">Edit Mode</h1>
            <div>
              <div className={"info" + this.state.open}>
                <div id="infostage">
                <Stage width={1500} height={600}
                  ref="graphicStage1"
                  onClick={this.handleStageClickInfo}
                  draggabble
                  onMouseMove={this.handleMouseOverInfo}
                  onMouseDown={this.onMouseDownInfo}
                  onMouseUp={this.handleMouseUpInfo}
                >
                  <Layer ref="layer3">
                    {this.state.rectangles.map(eachRect => {
                      if(eachRect.level === this.state.level && eachRect.infolevel === true && eachRect.rolelevel === this.state.rolelevel)
                        return (
                          <Rect
                          visible={eachRect.visible}
                          rotation={eachRect.rotation}
                          ref={eachRect.ref}
                          fill={eachRect.fill}
                          fillPatternImage={eachRect.fillPatternImage}
                          fillPatternOffset={eachRect.fillPatternOffset}
                          image={eachRect.image}
                          opacity={eachRect.opacity}
                          id={eachRect.id}
                          name="shape"
                          x={eachRect.x}
                          y={eachRect.y}
                          width={eachRect.width}
                          height={eachRect.height}
                          stroke={eachRect.stroke}
                          strokeWidth={eachRect.strokeWidth}
                          strokeScaleEnabled={false}
                          draggable
                            onClick={() => {
                              var that = this;
                              if (eachRect.link !== undefined && eachRect.link !== "") {
                                this.setState(
                                  {
                                    errMsg: "Links will not be opened in create mode"
                                  },
                                  () => {
                                    setTimeout(function() {
                                      that.setState({
                                        errMsg: ""
                                      });
                                    }, 1000);
                                  }
                                );
                              }
                            }}
                            onTransformStart={() => {
                              this.setState({
                                isTransforming: true
                              });
                              let rect = this.refs[eachRect.ref];
                              rect.setAttr("lastRotation", rect.rotation());
                            }}
                            onTransform={() => {
                              let rect = this.refs[eachRect.ref];

                              if (rect.attrs.lastRotation !== rect.rotation()) {
                                this.state.arrows.map(eachArrow => {
                                  if (
                                    eachArrow.to &&
                                    eachArrow.to.name() === rect.name()
                                  ) {
                                    this.setState({
                                      errMsg:
                                        "Rotating rects with connectors might skew things up!"
                                    });
                                  }
                                  if (
                                    eachArrow.from &&
                                    eachArrow.from.name() === rect.name()
                                  ) {
                                    this.setState({
                                      errMsg:
                                        "Rotating rects with connectors might skew things up!"
                                    });
                                  }
                                });
                              }

                              rect.setAttr("lastRotation", rect.rotation());
                            }}
                            onTransformEnd={() => {
                              this.setState({
                                isTransforming: false
                              });

                              let rect = this.refs[eachRect.ref];

                              this.setState(
                                prevState => ({
                                  errMsg: "",
                                  rectangles: prevState.rectangles.map(eachRect =>
                                    eachRect.id === rect.attrs.id
                                      ? {
                                          ...eachRect,
                                          width: rect.width() * rect.scaleX(),
                                          height: rect.height() * rect.scaleY(),
                                          rotation: rect.rotation(),
                                          x: rect.x(),
                                          y: rect.y(),

                                        }
                                      : eachRect
                                  )
                                }),
                                () => {
                                  this.forceUpdate();
                                }
                              );

                              rect.setAttr("scaleX", 1);
                              rect.setAttr("scaleY", 1);
                            }}

                            onDragMove={() => {
                              this.state.arrows.map(eachArrow => {
                                if (eachArrow.from !== undefined) {
                                  if (eachRect.name === eachArrow.from.attrs.name) {
                                    eachArrow.points = [
                                      eachRect.x,
                                      eachRect.y,
                                      eachArrow.points[2],
                                      eachArrow.points[3]
                                    ];
                                    this.forceUpdate();
                                  }
                                }

                                if (eachArrow.to !== undefined) {
                                  if (eachRect.name === eachArrow.to.attrs.name) {
                                    eachArrow.points = [
                                      eachArrow.points[0],
                                      eachArrow.points[1],
                                      eachRect.x,
                                      eachRect.y
                                    ];
                                    this.forceUpdate();
                                  }
                                }
                              });
                            }}
                            onDragEnd={event => {
                              //cannot compare by name because currentSelected might not be the same
                              //have to use ref, which appears to be overcomplicated
                              var shape = this.refs[eachRect.ref];
                              /*    this.state.rectangles.map(eachRect => {
                                  if (eachRect.name === shape.attrs.name) {
                                    shape.position({
                                      x: event.target.x(),
                                      y: event.target.y()
                                    });
                                  }
                                });*/

                              this.setState(prevState => ({
                                rectangles: prevState.rectangles.map(eachRect =>
                                  eachRect.id === shape.attrs.id
                                    ? {
                                        ...eachRect,
                                        x: event.target.x(),
                                        y: event.target.y(),
                                      }
                                    : eachRect
                                )
                              }));
                            }}
                            onContextMenu={e => {

                              e.evt.preventDefault(true);
                              const mousePosition = this.refs.graphicStage1.getPointerPosition();

                              this.setState({
                                selectedContextMenu: {
                                  type: "START",
                                  position: mousePosition
                                }
                              });
                            }
                            }

                          />
                        );
                      })}
                      {this.state.selectedContextMenu && (
                        <Portal>
                      <ContextMenu
                        {...this.state.selectedContextMenu}
                        selectedshape={this.state.selectedShapeName}
                        onOptionSelected={this.handleOptionSelected}
                        choosecolors={this.handleColorS}
                        choosecolorf={this.handleColorF}
                        handleWidth={this.handleWidth}
                        handleOpacity={this.handleOpacity}
                        close={this.handleClose}
                        copy={this.handleCopy}
                        cut={this.handleCut}
                        paste={this.handlePaste}
                        delete={this.handleDelete}
                      />
                      </Portal>
                    )}

                      {this.state.ellipses.map(eachEllipse => {
                        if(eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel)
                        return (
                        <Ellipse
                          visible={eachEllipse.visible}
                          ref={eachEllipse.ref}
                          name="shape"
                          id={eachEllipse.id}
                          x={eachEllipse.x}
                          y={eachEllipse.y}
                          opacity={eachEllipse.opacity}
                          rotation={eachEllipse.rotation}
                          radiusX={eachEllipse.radiusX}
                          radiusY={eachEllipse.radiusY}
                          fill={eachEllipse.fill}
                          stroke={eachEllipse.stroke}
                          strokeWidth={eachEllipse.strokeWidth}
                          strokeScaleEnabled={false}
                          onClick={() => {
                            var that = this;
                            if (
                              eachEllipse.link !== undefined &&
                              eachEllipse.link !== ""
                            ) {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({ isTransforming: true });
                            let ellipse = this.refs[eachEllipse.ref];
                            ellipse.setAttr("lastRotation", ellipse.rotation());
                          }}
                          onTransform={() => {
                            let ellipse = this.refs[eachEllipse.ref];

                            if (ellipse.attrs.lastRotation !== ellipse.rotation()) {
                              this.state.arrows.map(eachArrow => {
                                if (
                                  eachArrow.to &&
                                  eachArrow.to.name() === ellipse.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating ellipses with connectors might skew things up!"
                                  });
                                }
                                if (
                                  eachArrow.from &&
                                  eachArrow.from.name() === ellipse.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating ellipses with connectors might skew things up!"
                                  });
                                }
                              });
                            }

                            ellipse.setAttr("lastRotation", ellipse.rotation());
                          }}
                          onTransformEnd={() => {
                            this.setState({ isTransforming: false });
                            let ellipse = this.refs[eachEllipse.ref];
                            let scaleX = ellipse.scaleX(),
                              scaleY = ellipse.scaleY();

                            this.setState(prevState => ({
                              errMsg: "",
                              ellipses: prevState.ellipses.map(eachEllipse =>
                                eachEllipse.id === ellipse.attrs.id
                                  ? {
                                      ...eachEllipse,

                                      radiusX: ellipse.radiusX() * ellipse.scaleX(),
                                      radiusY: ellipse.radiusY() * ellipse.scaleY(),
                                      rotation: ellipse.rotation(),
                                      x: ellipse.x(),
                                      y: ellipse.y()
                                    }
                                  : eachEllipse
                              )
                            }));

                            ellipse.setAttr("scaleX", 1);
                            ellipse.setAttr("scaleY", 1);
                            this.forceUpdate();
                          }}
                          draggable
                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                console.log("prevArrow: ", eachArrow.points);
                                if (eachEllipse.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachEllipse.x,
                                    eachEllipse.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();

                                  this.refs.graphicStage.draw();
                                }
                                console.log("new arrows:", eachArrow.points);
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachEllipse.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachEllipse.x,
                                    eachEllipse.y
                                  ];
                                  this.forceUpdate();
                                  this.refs.graphicStage.draw();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {
                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachEllipse.ref];

                            this.setState(prevState => ({
                              ellipses: prevState.ellipses.map(eachEllipse =>
                                eachEllipse.id === shape.attrs.id
                                  ? {
                                      ...eachEllipse,
                                      x: event.target.x(),
                                      y: event.target.y()
                                    }
                                  : eachEllipse
                              )
                            }));

                            this.refs.graphicStage.draw();
                          }}
                          onContextMenu={e => {

                            e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }
                        />
                      );
                    })}
                      {this.state.lines.map((eachLine, i) => {
                        if(eachLine.level === this.state.level && eachLine.infolevel === true && eachLine.rolelevel === this.state.rolelevel)
                        return(
                          <Line
                            id={eachLine.id}
                            level={eachLine.level}
                            key={i}
                            points={eachLine.points}
                            stroke={eachLine.color}
                            strokeWidth={5}
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation={
                              eachLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                            draggable
                            onContextMenu={e => {

                              e.evt.preventDefault(true);
                              const mousePosition = e.target.getStage().getPointerPosition();

                              this.setState({
                                selectedContextMenu: {
                                  type: "START",
                                  position: mousePosition
                                }
                              });
                            }
                            }
                          />
                      );
                      })}

                      {this.state.images.map(eachImage => {
                        if(eachImage.level === this.state.level && eachImage.infolevel === true && eachImage.rolelevel === this.state.rolelevel)
                        return (
                        <URLImage
                          visible={eachImage.visible}
                          src={eachImage.imgsrc}
                          image={eachImage.imgsrc}
                          ref={eachImage.ref}
                          name="shape"
                          id={eachImage.id}
                          layer={this.refs.layer2}
                          x={eachImage.x}
                          y={eachImage.y}
                          width={eachImage.width}
                          height={eachImage.height}
                          stroke={eachImage.stroke}
                          strokeWidth={eachImage.strokeWidth}
                          rotation={eachImage.rotation}
                          opacity={eachImage.opacity}
                          onClick={() => {
                            var that = this;
                            if (eachImage.link !== undefined && eachImage.link !== "") {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({
                              isTransforming: true
                            });

                          }}
                          onTransform={() => {

                          }}
                          onTransformEnd={() => {
                            this.setState({
                              isTransforming: false
                            });
                            let triangle = this.refs[eachImage.ref];

                        }}

                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachImage.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachImage.x,
                                    eachImage.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachImage.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachImage.x,
                                    eachImage.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {

                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachImage.ref];
                            /*    this.state.rectangles.map(eachRect => {
                                if (eachRect.name === shape.attrs.name) {
                                  shape.position({
                                    x: event.target.x(),
                                    y: event.target.y()
                                  });
                                }
                              });*/
                              console.log(this.refs)

                            this.setState(prevState => ({
                              images: prevState.images.map(eachRect =>
                                eachRect.id === shape.props.id
                                  ? {
                                      ...eachRect,
                                      x: event.target.x(),
                                      y: event.target.y(),
                                    }
                                  : eachRect
                              )
                            }));

                          }}
                          onContextMenu={e => {

                            e.evt.preventDefault(true);
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }

                        />
                    );
                    })}
                      {this.state.videos.map(eachVideo => {
                        if(eachVideo.level === this.state.level && eachVideo.infolevel === true && eachVideo.rolelevel === this.state.rolelevel)
                        return (
                        <URLvideo
                          visible={eachVideo.visible}
                          src={eachVideo.vidsrc}
                          image={eachVideo.vidsrc}
                          ref={eachVideo.ref}
                          id={eachVideo.id}
                          name="shape"
                          layer={this.refs.layer2}
                          x={eachVideo.x}
                          y={eachVideo.y}
                          width={eachVideo.width}
                          height={eachVideo.height}
                          stroke={eachVideo.stroke}
                          strokeWidth={eachVideo.strokeWidth}
                          rotation={eachVideo.rotation}
                          opacity={eachVideo.opacity}
                          onClick={() => {
                            var that = this;
                            if (eachVideo.link !== undefined && eachVideo.link !== "") {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({
                              isTransforming: true
                            });

                          }}
                          onTransform={() => {

                          }}
                          onTransformEnd={() => {
                            this.setState({
                              isTransforming: false
                            });
                            let triangle = this.refs[eachVideo.ref];

                        }}

                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachVideo.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachVideo.x,
                                    eachVideo.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachVideo.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachVideo.x,
                                    eachVideo.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {
                            console.log(this.state.videos)
                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachVideo.ref];
                            this.setState(prevState => ({
                              videos: prevState.videos.map(eachRect =>
                                eachRect.id === this.state.currentSelected
                                  ? {
                                      ...eachRect,
                                      x: event.target.x(),
                                      y: event.target.y(),
                                    }
                                  : eachRect
                              )
                            }));
                          }}
                          onContextMenu={e => {

                            e.evt.preventDefault(true);
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }

                        />
                    );
                    })}
                      {this.state.audios.map(eachAudio => {
                        if(eachAudio.level === this.state.level && eachAudio.infolevel === true && eachAudio.rolelevel === this.state.rolelevel)
                        return (
                        <URLvideo
                          visible={eachAudio.visible}
                          fillPatternImage={true}
                          src={eachAudio.audsrc}
                          image={eachAudio.imgsrc}
                          ref={eachAudio.ref}
                          id={eachAudio.id}
                          name="shape"
                          layer={this.refs.layer2}
                          x={eachAudio.x}
                          y={eachAudio.y}
                          width={eachAudio.width}
                          height={eachAudio.height}
                          stroke={eachAudio.stroke}
                          strokeWidth={eachAudio.strokeWidth}
                          rotation={eachAudio.rotation}
                          opacity={eachAudio.opacity}
                          onClick={() => {

                            var that = this;
                            if (eachAudio.link !== undefined && eachAudio.link !== "") {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({
                              isTransforming: true
                            });

                          }}
                          onTransform={() => {

                          }}
                          onTransformEnd={() => {
                            this.setState({
                              isTransforming: false
                            });
                            let triangle = this.refs[eachAudio.ref];

                        }}

                          onDragMove={() => {

                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachAudio.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachAudio.x,
                                    eachAudio.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachAudio.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachAudio.x,
                                    eachAudio.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {

                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachAudio.ref];



                            this.setState(prevState => ({
                              videos: prevState.videos.map(eachRect =>
                                eachRect.id === this.state.currentSelected
                                  ? {
                                      ...eachRect,
                                      x: event.target.x(),
                                      y: event.target.y(),
                                    }
                                  : eachRect
                              )
                            }));
                          }}
                          onContextMenu={e => {

                            e.evt.preventDefault(true);
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }

                        />
                    );
                    })}
                      {this.state.documents.map(eachDoc => {
                        if(eachDoc.level === this.state.level && eachDoc.infolevel === true && eachDoc.rolelevel === this.state.rolelevel)
                        return (
                        <Rect
                          rotation={eachDoc.rotation}
                          ref={eachDoc.ref}
                          fill={eachDoc.fill}
                          fillPatternImage={this.state.docimage}
                          fillPatternOffset={eachDoc.fillPatternOffset}
                          fillPatternScaleY={0.2}
                          fillPatternScaleX={0.2}
                          image={eachDoc.image}
                          opacity={eachDoc.opacity}
                          id={eachDoc.id}
                          name="shape"
                          x={eachDoc.x}
                          y={eachDoc.y}
                          width={eachDoc.width}
                          height={eachDoc.height}
                          stroke={eachDoc.stroke}
                          strokeWidth={eachDoc.strokeWidth}
                          onClick={() => {
                            console.log(this.state.docsrc)
                            fetch(this.state.docsrc, {
                                method: 'GET',
                                headers: {
                                  'Content-Type': 'application/pdf',
                                },
                              })
                              .then((response) => response.blob())
                              .then((blob) => {
                                console.log(blob)

                                // Create blob link to download
                                const url = window.URL.createObjectURL(
                                  new Blob([blob]),
                                );
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute(
                                  'download',
                                  this.state.docsrc,
                                );

                                // Append to html link element page
                                document.body.appendChild(link);

                                // Start download
                                link.click();

                                // Clean up and remove the link
                                link.parentNode.removeChild(link);
                              });
                            }}
                          onTransformStart={() => {
                            this.setState({
                              isTransforming: true
                            });

                          }}
                          onTransform={() => {

                          }}
                          onTransformEnd={() => {
                            this.setState({
                              isTransforming: false
                            });
                            let triangle = this.refs[eachDoc.ref];

                        }}
                        draggable
                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachDoc.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachDoc.x,
                                    eachDoc.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachDoc.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachDoc.x,
                                    eachDoc.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {

                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachDoc.ref];
                            /*    this.state.rectangles.map(eachRect => {
                                if (eachRect.name === shape.attrs.name) {
                                  shape.position({
                                    x: event.target.x(),
                                    y: event.target.y()
                                  });
                                }
                              });*/


                            this.setState(prevState => ({
                              documents: prevState.documents.map(eachRect =>
                                eachRect.id === this.state.currentSelected
                                  ? {
                                      ...eachRect,
                                      x: event.target.x(),
                                      y: event.target.y(),
                                    }
                                  : eachRect
                              )
                            }));
                          }}
                          onContextMenu={e => {

                            e.evt.preventDefault(true);
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }

                        />
                    );
                    })}
                      {this.state.triangles.map(eachEllipse => {
                        if(eachEllipse.level === this.state.level && eachEllipse.infolevel === true && eachEllipse.rolelevel === this.state.rolelevel)
                        return (
                        <RegularPolygon
                          visible={eachEllipse.visible}
                          ref={eachEllipse.ref}
                          id={eachEllipse.id}
                          name="shape"
                          x={eachEllipse.x}
                          y={eachEllipse.y}
                          opacity={eachEllipse.opacity}
                          rotation={eachEllipse.rotation}
                          height={eachEllipse.height}
                          sides={eachEllipse.sides}
                          radius={eachEllipse.radius}
                          fill={eachEllipse.fill}
                          stroke={eachEllipse.stroke}
                          strokeWidth={eachEllipse.strokeWidth}
                          strokeScaleEnabled={false}
                          onClick={() => {
                            var that = this;
                            if (
                              eachEllipse.link !== undefined &&
                              eachEllipse.link !== ""
                            ) {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({ isTransforming: true });
                            let triangle = this.refs[eachEllipse.ref];
                            triangle.setAttr("lastRotation", triangle.rotation());
                          }}
                          onTransform={() => {
                            let triangle = this.refs[eachEllipse.ref];

                            if (triangle.attrs.lastRotation !== triangle.rotation()) {
                              this.state.arrows.map(eachArrow => {
                                if (
                                  eachArrow.to &&
                                  eachArrow.to.name() === triangle.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating ellipses with connectors might skew things up!"
                                  });
                                }
                                if (
                                  eachArrow.from &&
                                  eachArrow.from.name() === triangle.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating ellipses with connectors might skew things up!"
                                  });
                                }
                              });
                            }

                            triangle.setAttr("lastRotation", triangle.rotation());
                          }}
                          onTransformEnd={() => {
                            this.setState({ isTransforming: false });
                            let triangle = this.refs[eachEllipse.ref];
                            let scaleX = triangle.scaleX(),
                                scaleY = triangle.scaleY();

                            this.setState(prevState => ({
                              errMsg: "",
                              triangles: prevState.triangles.map(eachEllipse =>
                                eachEllipse.id === triangle.attrs.id
                                  ? {
                                      ...eachEllipse,

                                      width: triangle.width() * triangle.scaleX(),
                                      height: triangle.height() * triangle.scaleY(),
                                      rotation: triangle.rotation(),
                                      x: triangle.x(),
                                      y: triangle.y()
                                    }
                                  : eachEllipse
                              )
                            }));

                            triangle.setAttr("scaleX", 1);
                            triangle.setAttr("scaleY", 1);
                            this.forceUpdate();
                          }}
                          draggable
                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                console.log("prevArrow: ", eachArrow.points);
                                if (eachEllipse.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachEllipse.x,
                                    eachEllipse.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                  this.refs.graphicStage.draw();
                                }
                                console.log("new arrows:", eachArrow.points);
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachEllipse.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachEllipse.x,
                                    eachEllipse.y
                                  ];
                                  this.forceUpdate();
                                  this.refs.graphicStage.draw();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {
                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachEllipse.ref];

                            this.setState(prevState => ({
                              triangles: prevState.triangles.map(eachEllipse =>
                                eachEllipse.id === shape.attrs.id
                                  ? {
                                      ...eachEllipse,
                                      x: event.target.x(),
                                      y: event.target.y()
                                    }
                                  : eachEllipse
                              )
                            }));

                            this.refs.graphicStage.draw();
                          }}
                          onContextMenu={e => {
                            e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }
                        />
                    );
                    })}
                      {this.state.stars.map(eachStar => {
                        if(eachStar.level === this.state.level && eachStar.infolevel === true && eachStar.rolelevel === this.state.rolelevel)
                        return (
                        <Star
                          visible={eachStar.visible}
                          ref={eachStar.ref}
                          id={eachStar.id}
                          name="shape"
                          x={eachStar.x}
                          y={eachStar.y}
                          innerRadius={eachStar.innerRadius}
                          outerRadius={eachStar.outerRadius}
                          numPoints={eachStar.numPoints}
                          stroke={eachStar.stroke}
                          strokeWidth={eachStar.strokeWidth}
                          fill={eachStar.fill}
                          opacity={eachStar.opacity}
                          strokeScaleEnabled={false}
                          rotation={eachStar.rotation}
                          onClick={() => {
                            var that = this;
                            if (eachStar.link !== undefined && eachStar.link !== "") {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );
                            }
                          }}
                          onTransformStart={() => {
                            this.setState({ isTransforming: true });
                          }}
                          onTransformEnd={() => {
                            this.setState({ isTransforming: false });
                            let star = this.refs[eachStar.ref];
                            let scaleX = star.scaleX(),
                              scaleY = star.scaleY();

                            this.setState(prevState => ({
                              stars: prevState.stars.map(eachStar =>
                                eachStar.id === star.attrs.id
                                  ? {
                                      ...eachStar,
                                      innerRadius: star.innerRadius() * star.scaleX(),
                                      outerRadius: star.outerRadius() * star.scaleX(),
                                      rotation: star.rotation(),
                                      x: star.x(),
                                      y: star.y()
                                    }
                                  : eachStar
                              )
                            }));
                            star.setAttr("scaleX", 1);
                            star.setAttr("scaleY", 1);
                            this.forceUpdate();
                          }}
                          draggable
                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachStar.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachStar.x,
                                    eachStar.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachStar.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachStar.x,
                                    eachStar.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {
                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachStar.ref];

                            this.setState(prevState => ({
                              stars: prevState.stars.map(eachStar =>
                                eachStar.id === shape.attrs.id
                                  ? {
                                      ...eachStar,
                                      x: event.target.x(),
                                      y: event.target.y()
                                    }
                                  : eachStar
                              )
                            }));
                          }}
                          onContextMenu={e => {
                            e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenu: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }
                        />
                    );
                    })}

                      {this.state.texts.map(eachText => {
                        if(eachText.level === this.state.level && eachText.infolevel === true && eachText.rolelevel === this.state.rolelevel)
                        return (
                        //perhaps this.state.texts only need to contain refs?
                        //so that we only need to store the refs to get more information
                        <Text
                          visible={eachText.visible}
                          textDecoration={eachText.link ? "underline" : ""}
                          onTransformStart={() => {
                            var currentText = this.refs[this.state.selectedShapeName];
                            currentText.setAttr("lastRotation", currentText.rotation());
                          }}
                          onTransform={() => {
                            var currentText = this.refs[this.state.selectedShapeName];

                            currentText.setAttr(
                              "width",
                              currentText.width() * currentText.scaleX()
                            );
                            currentText.setAttr("scaleX", 1);

                            currentText.draw();

                            if (
                              currentText.attrs.lastRotation !== currentText.rotation()
                            ) {
                              this.state.arrows.map(eachArrow => {
                                if (
                                  eachArrow.to &&
                                  eachArrow.to.name() === currentText.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating texts with connectors might skew things up!"
                                  });
                                }
                                if (
                                  eachArrow.from &&
                                  eachArrow.from.name() === currentText.name()
                                ) {
                                  this.setState({
                                    errMsg:
                                      "Rotating texts with connectors might skew things up!"
                                  });
                                }
                              });
                            }

                            currentText.setAttr("lastRotation", currentText.rotation());
                          }}
                          onTransformEnd={() => {
                            var currentText = this.refs[this.state.selectedShapeName];

                            this.setState(prevState => ({
                              errMsg: "",
                              texts: prevState.texts.map(eachText =>
                                eachText.id === this.state.selectedShapeName
                                  ? {
                                      ...eachText,
                                      width: currentText.width(),
                                      rotation: currentText.rotation(),
                                      textWidth: currentText.textWidth,
                                      textHeight: currentText.textHeight,
                                      x: currentText.x(),
                                      y: currentText.y()
                                    }
                                  : eachText
                              )
                            }));
                            currentText.setAttr("scaleX", 1);
                            currentText.draw();
                          }}
                          link={eachText.link}
                          width={eachText.width}
                          fill={eachText.fill}
                          opacity={eachText.opacity}
                          id={eachText.id}
                          name="shape"
                          ref={eachText.ref}
                          rotation={eachText.rotation}
                          fontFamily={eachText.fontFamily}
                          fontSize={eachText.fontSize}
                          x={eachText.x}
                          y={eachText.y}
                          text={eachText.text}
                          draggable
                          onDragMove={() => {
                            this.state.arrows.map(eachArrow => {
                              if (eachArrow.from !== undefined) {
                                if (eachText.name === eachArrow.from.attrs.name) {
                                  eachArrow.points = [
                                    eachText.x,
                                    eachText.y,
                                    eachArrow.points[2],
                                    eachArrow.points[3]
                                  ];
                                  this.forceUpdate();
                                }
                              }

                              if (eachArrow.to !== undefined) {
                                if (eachText.name === eachArrow.to.attrs.name) {
                                  eachArrow.points = [
                                    eachArrow.points[0],
                                    eachArrow.points[1],
                                    eachText.x,
                                    eachText.y
                                  ];
                                  this.forceUpdate();
                                }
                              }
                            });
                          }}
                          onDragEnd={event => {
                            //cannot compare by name because currentSelected might not be the same
                            //have to use ref, which appears to be overcomplicated
                            var shape = this.refs[eachText.ref];

                            this.setState(prevState => ({
                              texts: prevState.texts.map(eachtext =>
                                eachtext.id === shape.attrs.id
                                  ? {
                                      ...eachtext,
                                      x: event.target.x(),
                                      y: event.target.y()
                                    }
                                  : eachtext
                              )
                            }));
                          }}
                          onClick={() => {
                            var that = this;
                            if (eachText.link !== undefined && eachText.link !== "") {
                              this.setState(
                                {
                                  errMsg: "Links will not be opened in create mode"
                                },
                                () => {
                                  setTimeout(function() {
                                    that.setState({
                                      errMsg: ""
                                    });
                                  }, 1000);
                                }
                              );

                              //var win = window.open(eachText.link, "_blank");
                              //win.focus();
                            }
                          }}
                          onDblClick={() => {
                            // turn into textarea
                            var stage = this.refs.graphicStage;
                            let text = this.refs[eachText.ref];
                            console.log(text)


                            this.setState({
                              textX: text.absolutePosition().x,
                              textY: text.absolutePosition().y,
                              textEditVisible: !this.state.textEditVisible,
                              text: eachText.text,
                              textNode: eachText,
                              currentTextRef: eachText.ref,
                              textareaWidth: text.textWidth,
                              textareaHeight: text.textHeight,
                              textareaFill: text.attrs.fill,
                              textareaFontFamily: text.attrs.fontFamily,
                              textareaFontSize: text.attrs.fontSize
                            });
                            let textarea = this.refs.textarea;
                            textarea.focus();
                            text.hide();
                            var transformer = stage.findOne(".transformer");
                            transformer.hide();
                            this.refs.layer2.draw();
                          }}
                          onContextMenu={e => {
                            e.evt.preventDefault(true); // NB!!!! Remember the ***TRUE***
                            const mousePosition = e.target.getStage().getPointerPosition();

                            this.setState({
                              selectedContextMenuText: {
                                type: "START",
                                position: mousePosition
                              }
                            });
                          }
                          }
                      />
                    );
                    })}
                    {this.state.selectedContextMenuText && (
                      <Portal>
                    <ContextMenuText
                      {...this.state.selectedContextMenuText}
                      selectedshape={this.state.selectedShapeName}
                      onOptionSelected={this.handleOptionSelected}
                      choosecolorf={this.handleColorF}
                      handleFont={this.handleFont}
                      handleSize={this.handleSize}
                      handleOpacity={this.handleOpacity}
                      close={this.handleClose}
                      copy={this.handleCopy}
                      cut={this.handleCut}
                      paste={this.handlePaste}
                      delete={this.handleDelete}
                    />
                    </Portal>
                  )}
                      {this.state.arrows.map(eachArrow => {
                        if (!eachArrow.from && !eachArrow.to && eachArrow.level === this.state.level && eachArrow.infolevel === true && eachArrow.rolelevel === this.state.rolelevel) {
                          return (
                            <Arrow
                              visible={eachArrow.visible}
                              ref={eachArrow.ref}
                              id={eachArrow.id}
                              name="shape"
                              points={[
                                eachArrow.points[0],
                                eachArrow.points[1],
                                eachArrow.points[2],
                                eachArrow.points[3]
                              ]}
                              stroke={eachArrow.stroke}
                              fill={eachArrow.fill}
                              draggable
                              onDragEnd={event => {
                                //set new points to current position

                                //usually: state => star => x & y
                                //now: state => arrow => attr => x & y

                                let oldPoints = [
                                  eachArrow.points[0],
                                  eachArrow.points[1],
                                  eachArrow.points[2],
                                  eachArrow.points[3]
                                ];

                                let shiftX = this.refs[eachArrow.ref].attrs.x;
                                let shiftY = this.refs[eachArrow.ref].attrs.y;

                                let newPoints = [
                                  oldPoints[0] + shiftX,
                                  oldPoints[1] + shiftY,
                                  oldPoints[2] + shiftX,
                                  oldPoints[3] + shiftY
                                ];

                                this.refs[eachArrow.ref].position({ x: 0, y: 0 });
                                this.refs.layer2.draw();

                                this.setState(prevState => ({
                                  arrows: prevState.arrows.map(eachArr =>
                                    eachArr.name === eachArrow.name
                                      ? {
                                          ...eachArr,
                                          points: newPoints
                                        }
                                      : eachArr
                                  )
                                }));
                              }}
                            />
                          );
                        } else if (
                          eachArrow.name === this.state.newArrowRef &&
                          (eachArrow.from || eachArrow.to)
                        ) {
                          return (
                            <Connector
                              id={eachArrow.id}
                              name="shape"
                              from={eachArrow.from}
                              to={eachArrow.to}
                              arrowEndX={this.state.arrowEndX}
                              arrowEndY={this.state.arrowEndY}
                              current={true}
                              stroke={eachArrow.stroke}
                              fill={eachArrow.fill}
                            />
                          );
                        } else if (eachArrow.from || eachArrow.to) {
                          //if arrow construction is completed
                          return (
                            <Connector
                              id={eachArrow.id}
                              name="shape"
                              from={eachArrow.from}
                              to={eachArrow.to}
                              points={eachArrow.points}
                              current={false}
                              stroke={eachArrow.stroke}
                              fill={eachArrow.fill}
                            />
                          );
                        }
                      })}
                      <TransformerComponent
                          selectedShapeName={this.state.selectedShapeName}
                          ref="trRef1"

                          boundBoxFunc={(oldBox, newBox) => {
                              // limit resize
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                        />
                      <Rect fill="rgba(0,0,0,0.5)" ref="selectionRectRef1" />

                  </Layer>
                </Stage>
                </div>
                {(this.state.open !== 1)
                  ? <button onClick={() => this.setState({open: 1})}><i class="fas fa-caret-square-up fa-3x"></i></button>
                  : <button onClick={() => this.setState({open: 0})}><i class="fas fa-caret-square-down fa-3x"></i></button>
                }
                <p id="rolesdrop">
                  <Dropdownroles
                    roleLevel={this.handleRoleLevel}
                    gameroles={this.state.gameroles}
                    gameid={this.state.gameinstanceid}
                  />
                </p>
                  <b>

                  </b>
                </div>
                {(1 === 1 )
                  ? <div id={"pencili" + this.state.open}>
                      <Pencil
                      editMode={this.editMode}
                      editModeToggle={true}
                      id="1"
                      psize="2"
                      type="main"
                      title="Edit Personal Space"
                      addRectangle={this.addRectangle}
                      addCircle={this.addCircle}
                      addStar={this.addStar}
                      addTriangle={this.addTriangle}
                      addImage={this.addImage}
                      addVideo={this.addVideo}
                      addText={this.addText}
                      addAudio={this.addAudio}
                      addStick={this.addStick}
                      addDocument={this.addDocument}
                      drawLine={this.drawLine}
                      eraseLine={this.eraseLine}
                      stopDrawing={this.stopDrawing}
                      handleImage={this.handleImage}
                      handleVideo={this.handleVideo}
                      handleAudio={this.handleAudio}
                      handleDocument={this.handleDocument}
                      choosecolor={this.chooseColor}
                      />
                    </div>
                  : ""
                  }
              </div>
            <Pencil
              editMode={this.editModeOff}
              editModeToggle={false}
              id="2"
              psize="3"
              type="main"
              title="Edit Group Space"
              addRectangle={this.addRectangle}
              addCircle={this.addCircle}
              addStar={this.addStar}
              addTriangle={this.addTriangle}
              addImage={this.addImage}
              addVideo={this.addVideo}
              addText={this.addText}
              addAudio={this.addAudio}
              addStick={this.addStick}
              addDocument={this.addDocument}
              drawLine={this.drawLine}
              eraseLine={this.eraseLine}
              stopDrawing={this.stopDrawing}
              handleImage={this.handleImage}
              handleVideo={this.handleVideo}
              handleAudio={this.handleAudio}
              handleDocument={this.handleDocument}
              choosecolor={this.chooseColor}
              />
            <Pencil
              id="3"
              psize="3"
              type="info"
              title=""
              ptype={this.handleType}
              num={this.handleNum}
            />
            <Pencil
              id="4"
              psize="2"
              type="nav"
              title=""
              mvisible={this.handleMvisible}
              avisible={this.handleAvisible}
              pavisible={this.handlePavisible}
              svisible={this.handleSvisible}
              pevisible={this.handlePevisible}/>
              />
              <Link to="/dashboard">
                <i id="editpagex" class="fas fa-times fa-3x"></i>
              </Link>
            </div>
      </React.Fragment>
    );
  }
}
export default Graphics;
