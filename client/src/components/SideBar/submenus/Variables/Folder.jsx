import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialDivs = [
  { id: 'div1', content: 'Div 1' },
  { id: 'div2', content: 'Div 2' },
  { id: 'div3', content: 'Div 3' },
];

const initialFolders = [
  { id: 'folder1', content: 'Folder 1', divs: [] },
];

function App() {
  const [divs, setDivs] = useState(initialDivs);
  const [folders, setFolders] = useState(initialFolders);

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Moving divs inside folders
    if (source.droppableId === 'divs' && destination.droppableId.includes('folder')) {
      const folderIndex = folders.findIndex(folder => 'folder' + folder.id === destination.droppableId);
      const div = divs.find(div => div.id === draggableId);

      const newFolders = [...folders];
      newFolders[folderIndex].divs.push(div);

      setFolders(newFolders);
      setDivs(divs => divs.filter(div => div.id !== draggableId));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="divs">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {divs.map((div, index) => (
              <Draggable key={div.id} draggableId={div.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    {div.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {folders.map((folder, index) => (
        <Droppable key={folder.id} droppableId={'folder' + folder.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {folder.content}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
}

export default App;
