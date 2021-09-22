import React, { forwardRef } from "react";
import { Transformer } from "react-konva";

const TransformerComponent = forwardRef((props, ref) => {

  const renderTransformer = () => {
    switch (props.selectedShapeName.replace(/\d+$/, "")) {
      case "text":
        return (
          <Transformer
            ref={ref}
            name="transformer"
            boundBoxFunc={(oldBox, newBox) => {
              newBox.width = Math.max(30, newBox.width);
              return newBox;
            }}
            enabledAnchors={["middle-left", "middle-right"]}
          />
        );
      case "star":
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
          />
        );
      case "arrow":
        return (
          <Transformer
            ref={ref}
            name="transformer"
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