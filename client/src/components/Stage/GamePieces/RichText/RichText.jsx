import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import CustomWrapper from "../CustomWrapper";
import Editor from '@draft-js-plugins/editor';
import { EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw } from 'draft-js';
import createTextAlignmentPlugin from '@draft-js-plugins/text-alignment';
import createStaticToolbarPlugin from '@draft-js-plugins/static-toolbar';
import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
} from '@draft-js-plugins/buttons';

import './RichText.css';
import 'draft-js/dist/Draft.css';

const textAlignmentPlugin = createTextAlignmentPlugin();
const staticToolbarPlugin = createStaticToolbarPlugin();

const { Toolbar } = staticToolbarPlugin;
const plugins = [staticToolbarPlugin, textAlignmentPlugin];

const RichText = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState(props.editorState ?
    EditorState.createWithContent(convertFromRaw(JSON.parse(props.editorState))) :
    EditorState.createEmpty());
  const editorRef = useRef(null);


  useEffect(() => {
    if (editorState && props.editMode) {
      props.setEditorState(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    }
  }, [editorState]);

  // Custom overrides for "code" style.
  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
  ];

  const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
  ];

  const getBlockStyle = useCallback((block) => {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  });

  const toggleBlockType = useCallback((blockType) => {
    setEditorState(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  });

  const toggleInlineStyle = useCallback((inlineStyle) => {
    setEditorState(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    );
  });

  const mapKeyToEditorCommand = useCallback((e) => {
    if (e.keyCode === 9) { // TAB
      const newEditorState = RichUtils.onTab(
        e,
        editorState,
        4, // maxDepth
      );
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  });

  const handleKeyCommand = useCallback((command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  });

  return (
    <CustomWrapper
      {...props}
      ref={ref}
    >
      <div className={`${!props.editMode ? "playMode" : ""} richTextContainer`}>
        <div className={`RichEditor-root`}>
          {props.selected && (
            <>
              <div className="RichEditor-controls">
                {BLOCK_TYPES.map((type) => {
                  const active = type.style === editorState
                    .getCurrentContent()
                    .getBlockForKey(editorState.getSelection().getStartKey())
                    .getType();
                  let className = 'RichEditor-styleButton';
                  if (active) {
                    className += ' RichEditor-activeButton';
                  }
                  return (
                    <span
                      key={type.label}
                      className={className}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleBlockType(type.style);
                      }}>
                      {type.label}
                    </span>
                  );
                })}
              </div>
              <div className="RichEditor-controls">
                {INLINE_STYLES.map((type) => {
                  const active = editorState.getCurrentInlineStyle().has(type.style);
                  let className = 'RichEditor-styleButton';
                  if (active) {
                    className += ' RichEditor-activeButton';
                  }
                  return (
                    <span
                      key={type.label}
                      className={className}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        toggleInlineStyle(type.style);
                      }}>
                      {type.label}
                    </span>
                  );
                })}
              </div>
            </>)}
          <div>
            <Editor
              plugins={plugins}
              ref={editorRef}
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              keyBindingFn={mapKeyToEditorCommand}
              onChange={setEditorState}
              placeholder="Tell a story..."
              spellCheck={true}
            />
            {/*<Toolbar>
              <ItalicButton />
              <BoldButton />
              <UnderlineButton />
            </Toolbar>
            <textAlignmentPlugin.TextAlignment />*/}
          </div>
        </div>
      </div>
    </CustomWrapper>
  );
});

export default RichText;
