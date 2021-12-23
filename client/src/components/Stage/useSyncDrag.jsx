import { useState, useEffect } from "react";

const useSyncDrag = ({x, y, status}) => {
  const [displayPos, setDisplayPos] = useState([x, y]);
  const [dragging, setDragging] = useState(false);
  
  useEffect(() => {
    if (status.x && status.y && !dragging) {
      setDisplayPos([status.x, status.y]);
    }
  }, [status, dragging]);

  return {
    displayPos, setDragging
  };
};

export default useSyncDrag;