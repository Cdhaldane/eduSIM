import React from 'react';
import { render } from 'react-dom';
import { Stage, Layer, Star, Text, Rect } from 'react-konva';
import "./Stage.css";

function generateShapes() {
  return [...Array(1)].map((_, i) => ({
    id: i.toString(),
    x: 0.46 * window.innerWidth,
    y: 0.45 * window.innerHeight,
    // rotation: Math.random() * 180,
    isDragging: false,
  }));
}

const INITIAL_STATE = generateShapes();

const Stages = () => {
  const [stars, setStars] = React.useState(INITIAL_STATE);
  const [rects, setRects] = React.useState(INITIAL_STATE);

  const handleDragStart = (e) => {
  const id = e.target.id();
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: star.id === id,
        };
      })
    );
  setRects(
    rects.map((rect) => {
      return {
        ...rect,
        isDragging: rect.id === id,
      };
    })
  );
};
  const handleDragEnd = (e) => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
    setRects(
      rects.map((rect) => {
        return {
          ...rect,
          isDragging: false,
        };
      })
    );

  };

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {stars.map((star) => (
          <Star
            key={star.id}
            id={star.id}
            x={star.x}
            y={star.y}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="black"
            draggable
            rotation={star.rotation}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={star.isDragging ? 10 : 5}
            shadowOffsetY={star.isDragging ? 10 : 5}  
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
          {rects.map((rect) => (
            <Rect
              key={rect.id}
              id={rect.id}
              x={rect.x}
              y={rect.y}
              width={50}
              height={50}
              draggable
              fill="black"
              draggable
              rotation={rect.rotation}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.6}

              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
        ))}
      </Layer>
    </Stage>
  );
};

export default Stages;

// shadowOffsetX={rect.isDragging ? 10 : 5}
// shadowOffsetY={rect.isDragging ? 10 : 5}
// scaleX={rect.isDragging ? 1.2 : 1}
// scaleY={rect.isDragging ? 1.2 : 1}

// shadowOffsetX={star.isDragging ? 10 : 5}
// shadowOffsetY={star.isDragging ? 10 : 5}
// scaleX={star.isDragging ? 1.2 : 1}
// scaleY={star.isDragging ? 1.2 : 1}
