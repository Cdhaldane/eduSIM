import React, { createContext, useEffect, useState } from 'react';

export const MenuContext = createContext();
import "./Variable.css"

export const MenuProvider = (props) => {
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    pageGroup: null,
  });

  useEffect(() => {
    const handleBlur = () => hideContextMenu();
  
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const handleContextMenu = (event, pageGroup) => {
    event.preventDefault();
    setContextMenu({
      show: true,
      x: event.clientX,
      y: event.clientY,
      pageGroup,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      show: false,
    });
  };

  return (
    <MenuContext.Provider value={{ contextMenu, handleContextMenu, hideContextMenu }}>
      <div onClick={hideContextMenu}>
        {props.children}
      </div>
    </MenuContext.Provider>
  );
};
