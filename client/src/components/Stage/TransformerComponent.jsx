import React, { forwardRef } from "react";
import { Transformer } from "react-konva";

import {
  Ellipse
} from "react-konva";

const TransformerComponent = forwardRef((props, ref) => {

  const renderTransformer = () => {
    const shape = props.refs[props.selectedShapeName] ? props.refs[props.selectedShapeName].attrs : null;
    //console.log(shape);
    switch (props.selectedShapeName.replace(/\d+$/, "")) {
      case "":
        // This is a group selection
        return (
          <Transformer
            ref={ref}
            name="transformer"
            resizeEnabled={false}
          />
        );
      case "texts":
        return (
          <Transformer
            ref={ref}
            name="transformer"
            boundBoxFunc={(oldBox, newBox) => {
              newBox.width = Math.max(30, newBox.width);
              return newBox;
            }}
            enabledAnchors={[
              "middle-left",
              "middle-right"
            ]}
            rotationSnaps={[0, 90, 180, 270]}
          />
        );
      case "triangles":
      case "stars":
      case "polls":
      case "connect4s":
      case "tics":
      case "inputs":
        return (
          <Transformer
            ref={ref}
            name="transformer"
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right"
            ]}
            rotationSnaps={[0, 90, 180, 270]}
          />
        );
      case "lines":
        return (
          <>
            <Transformer
              ref={ref}
              name="transformer"
              resizeEnabled={false}
              rotateEnabled={false}
              borderEnabled={false}
            />
            {shape && (
              <>
                <Ellipse
                  fill={"white"}
                  stroke={"#1eacff"}
                  strokeWidth={8}
                  radiusX={shape.strokeWidth}
                  radiusY={shape.strokeWidth}
                  x={shape.x + shape.points[0]}
                  y={shape.y + shape.points[1]}
                  onMouseMove={(e) => {
                    document.body.style.cursor = "move";
                  }}
                  onMouseLeave={(e) => {
                    document.body.style.cursor = "auto";
                  }}
                />
                <Ellipse
                  fill={"white"}
                  stroke={"#1eacff"}
                  strokeWidth={8}
                  radiusX={shape.strokeWidth}
                  radiusY={shape.strokeWidth}
                  x={shape.x + shape.points[2]}
                  y={shape.y + shape.points[3]}
                />
              </>
            )}
          </>
        );
      case "arrows":
        return (
          <Transformer
            ref={ref}
            name="transformer"
            resizeEnabled={false}
            rotateEnabled={false}
            borderEnabled={false}
          />
        );
      case "customRect":
      case "ContainerRect":
        return (
          <Transformer
            ref={ref}
            resizeEnabled={false}
            rotateEnabled={false}
          />
        );
      default:
        return (
          <Transformer
            ref={ref}
            name="transformer"
            keepRatio={true}
            rotationSnaps={[0, 90, 180, 270]}
          />
        );
    }
  }

  return (
    <>
      {renderTransformer()}
    </>
  );
});

export default TransformerComponent;