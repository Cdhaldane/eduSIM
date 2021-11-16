import React, { Component } from "react";
import {
  Stage,
  Layer
} from "react-konva";

class Overlay extends Component {

  constructor(props) {
    super(props);
  }

  componentDidUpdate = () => {
    for (let i = 0; i < Object.keys(this.refs).length; i++) {
      const key = Object.keys(this.refs)[i];
      if (key !== "customRect") {
        this.props.setRefs(key, this.refs[key]);
      }
    }
  }

  render() {
    return (
      <div className="overlayMain">
        <div>
          <div className="area overlayCanvas">
            <i className="fas fa-times fa-3x" onClick={this.props.closeOverlay} />
            {/* The Konva Stage */}
            <div
              onKeyDown={this.props.onKeyDown}
              onKeyUp={this.props.onKeyUp}
              id="overlayCanvasContainer"
              tabIndex="0"
              onContextMenu={(e) => e.preventDefault()}
            >
              <Stage
                ref={"overlayStage"}
                height={document.getElementById("overlayCanvasContainer") ?
                  document.getElementById("overlayCanvasContainer").clientHeight : 0}
                width={document.getElementById("overlayCanvasContainer") ?
                  document.getElementById("overlayCanvasContainer").clientWidth : 0}
                onMouseDown={(e) => this.props.onMouseDown(e, false)}
                onMouseUp={(e) => this.props.onMouseUp(e, false)}
                onMouseMove={(e) => this.props.onMouseMove(e, false)}
                onWheel={(e) => this.props.onWheel(e, false)}
                onContextMenu={(e) => e.evt.preventDefault()}
                // Mobile Event Listeners
                onTouchStart={(e) => this.props.onMouseDown(e, false)}
                onTouchEnd={(e) => this.props.onMouseUp(e, false)}
              >
                <Layer
                  ref={"overlayLayer"}
                  scaleX={this.props.state.overlayLayerScale}
                  scaleY={this.props.state.overlayLayerScale}
                  x={this.props.state.overlayLayerX}
                  y={this.props.state.overlayLayerY}
                  height={window.innerHeight}
                  width={window.innerWidth}
                  draggable={this.props.state.layerDraggable}
                  onDragMove={(e) => this.props.onDragMove(e, false)}
                >
                  {this.props.propsIn.loadObjects("overlay", "edit")}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Overlay;