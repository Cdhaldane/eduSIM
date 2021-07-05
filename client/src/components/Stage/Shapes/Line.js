import Konva from "konva";
export const addLine = ( stage, layer, mode = "brush", color) => {
  let colour = "green";
  let isPaint = false;
  let lastLine;
  stage.on("mousedown touchstart", function(e) {
    isPaint = true;
    let pos = stage.getPointerPosition();
    lastLine = new Konva.Line({
      stroke: mode == "brush" ? color : "yellow",
      strokeWidth: mode == "brush" ? 5 : 20,
      globalCompositeOperation:
        mode === "brush" ? "source-over" : "destination-out",
      points: [pos.x, pos.y],
      draggable: mode == "brush",
    });
    layer.add(lastLine);
  });
  stage.on("mouseup touchend", function() {
    console.log(color)
    isPaint = false;
  });
  stage.on("mousemove touchmove", function() {
    if (!isPaint) {
      return;
    }
  const pos = stage.getPointerPosition();
    let newPoints = lastLine.points().concat([pos.x, pos.y]);
    lastLine.points(newPoints);
    layer.batchDraw();
  });
};
