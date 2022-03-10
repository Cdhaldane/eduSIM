import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import CustomWrapper from "../CustomWrapper";
import { useTranslation } from "react-i18next";
import Editor from '@draft-js-plugins/editor';
import {
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  convertToRaw,
  convertFromRaw,
  Modifier
} from 'draft-js';

import './RichText.css';
import 'draft-js/dist/Draft.css';

const RichText = forwardRef((props, ref) => {
  const [editorState, setEditorState] = useState(props.editorState ?
    EditorState.createWithContent(convertFromRaw(JSON.parse(props.editorState))) :
    EditorState.createEmpty());
  const [fontSizeMenuOpen, setFontSizeMenuOpen] = useState(false);
  const [fontFamilyMenuOpen, setFontFamilyMenuOpen] = useState(false);
  const [fontColorMenuOpen, setFontColorMenuOpen] = useState(false);
  const editorRef = useRef(null);
  const fontSizeRef = useRef(null);
  const fontFamilyRef = useRef(null);
  const fontColorRef = useRef(null);

  const { t } = useTranslation();

  const handleClickOutside = e => {
    if (fontSizeRef.current && !fontSizeRef.current.contains(e.target)) {
      setFontSizeMenuOpen(false);
    }
    if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target)) {
      setFontFamilyMenuOpen(false);
    }
    if (fontColorRef.current && !fontColorRef.current.contains(e.target)) {
      setFontColorMenuOpen(false);
    }
  }

  useEffect(() => {
    // Close the dropdowns (such as for font size and font family) if click away
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
  }, []);

  // Some line icons don't look good in this component so it uses custom icons
  const iconPaths = {
    bulletList: "richTextIcons/bulletList.png",
    orderedList: "richTextIcons/orderedList.png",
    alignLeft: "richTextIcons/alignLeft.png",
    alignRight: "richTextIcons/alignRight.png",
    alignCenter: "richTextIcons/alignCenter.png",
    alignJustify: "richTextIcons/alignJustify.png",
    bold: "richTextIcons/bold.png",
    italic: "richTextIcons/italic.png",
    underline: "richTextIcons/underline.png",
    fontSize: "richTextIcons/fontSize.png",
    fontColor: "richTextIcons/fontColor.png"
  }

  useEffect(() => {
    if (editorState && props.editMode) {
      props.setEditorState(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
    }
  }, [editorState]);

  useEffect(() => {
    if (props.stateWithMacros) {
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(props.stateWithMacros))));
    }
  }, [props.stateWithMacros]);

  // The font colors
  const BLACK = "#000000";
  const GREY = "#676767";
  const GREEN = "#2ba000";
  const BLUE = "#0055b2";
  const RED = "#d80f0f";
  const ORANGE = "#d97600";
  const YELLOW = "#deeb00";

  // Custom overrides for "code" style.
  const styleMap = {
    // Font Sizes
    FONT_SIZE_8: { fontSize: "8px" },
    FONT_SIZE_10: { fontSize: "10px" },
    FONT_SIZE_12: { fontSize: "12px" },
    FONT_SIZE_14: { fontSize: "14px" },
    FONT_SIZE_18: { fontSize: "18px" },
    FONT_SIZE_24: { fontSize: "24px" },
    FONT_SIZE_30: { fontSize: "30px" },
    FONT_SIZE_36: { fontSize: "36px" },
    FONT_SIZE_48: { fontSize: "48px" },
    FONT_SIZE_60: { fontSize: "60px" },
    FONT_SIZE_72: { fontSize: "72px" },

    // Font Families
    FONT_FAMILY_ARIAL: { fontFamily: "Arial" },
    FONT_FAMILY_TAHOMA: { fontFamily: "Tahoma" },
    FONT_FAMILY_TIMES_NEW_ROMAN: { fontFamily: "Times New Roman" },
    FONT_FAMILY_GEORGIA: { fontFamily: "Georgia" },
    FONT_FAMILY_GARAMOND: { fontFamily: "Garamond" },
    FONT_FAMILY_COURIER_NEW: { fontFamily: "Courier New" },
    FONT_FAMILY_BRUSH_SCRIPT_MT: { fontFamily: "Brush Script MT" },

    // Font Colors
    FONT_COLOR_BLACK: { color: BLACK },
    FONT_COLOR_GREY: { color: GREY },
    FONT_COLOR_GREEN: { color: GREEN },
    FONT_COLOR_BLUE: { color: BLUE },
    FONT_COLOR_RED: { color: RED },
    FONT_COLOR_ORANGE: { color: ORANGE },
    FONT_COLOR_YELLOW: { color: YELLOW },
  };

  const BLOCK_TYPES = [
    { label: 'Left', style: 'left-align' },
    { label: 'Center', style: 'center-align' },
    { label: 'Right', style: 'right-align' },
    { label: 'Justified', style: 'justify-align' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' }
  ];

  const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'FontSize', style: 'FONT_SIZE_' },
    { label: 'FontFamily', style: 'FONT_FAMILY_' },
    { label: 'FontColor', style: 'FONT_COLOR_' }
  ];

  const getBlockStyle = useCallback((block) => {
    switch (block.getType()) {
      case 'blockquote':
        return 'RichEditor-blockquote';
      case 'left-align':
        return 'RichEditor-leftAlign';
      case 'right-align':
        return 'RichEditor-rightAlign';
      case 'center-align':
        return 'RichEditor-centerAlign';
      case 'justify-align':
        return 'RichEditor-justifyAlign';
      default:
        return null;
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

  const fontSizeBtn = (e, type) => {
    // Remove any exisiting font size styles on selection
    const sizeStyles = Object.keys(styleMap).filter(style => style.includes("FONT_SIZE"));
    const contentState = editorState.getCurrentContent();
    const contentWithoutFontSizes = sizeStyles.reduce(
      (newContentState, style) =>
        Modifier.removeInlineStyle(
          newContentState,
          editorState.getSelection(),
          style
        ),
      contentState
    );

    // Add new font size style
    const style = type.style + e.target.innerText;
    const contentWithNewSize = Modifier.applyInlineStyle(
      contentWithoutFontSizes,
      editorState.getSelection(),
      style
    );

    const newEditorState = EditorState.push(
      editorState,
      contentWithNewSize,
      'change-inline-style'
    );

    // Set the new font size
    setEditorState(newEditorState);
  }

  const fontFamilyBtn = (e, type) => {
    // Remove any exisiting font families on selection
    const familyStyles = Object.keys(styleMap).filter(style => style.includes("FONT_FAMILY"));
    const contentState = editorState.getCurrentContent();
    const contentWithoutFontFamily = familyStyles.reduce(
      (newContentState, style) =>
        Modifier.removeInlineStyle(
          newContentState,
          editorState.getSelection(),
          style
        ),
      contentState
    );

    // Add new font style
    const style = type.style + e.target.innerText.replaceAll(" ", "_").toUpperCase();
    const contentWithNewFont = Modifier.applyInlineStyle(
      contentWithoutFontFamily,
      editorState.getSelection(),
      style
    );

    const newEditorState = EditorState.push(
      editorState,
      contentWithNewFont,
      'change-inline-style'
    );

    // Set the new font family
    setEditorState(newEditorState);
  }

  const fontColorBtn = (e, type) => {
    // Remove any exisiting font colors on selection
    const colorStyles = Object.keys(styleMap).filter(style => style.includes("FONT_COLOR"));
    const contentState = editorState.getCurrentContent();
    const contentWithoutColors = colorStyles.reduce(
      (newContentState, style) =>
        Modifier.removeInlineStyle(
          newContentState,
          editorState.getSelection(),
          style
        ),
      contentState
    );

    // Add new color style
    const style = type.style + e.target.innerText.replaceAll(" ", "_").toUpperCase();
    const contentWithNewColor = Modifier.applyInlineStyle(
      contentWithoutColors,
      editorState.getSelection(),
      style
    );

    const newEditorState = EditorState.push(
      editorState,
      contentWithNewColor,
      'change-inline-style'
    );

    // Set the new font family
    setEditorState(newEditorState);
  }

  return (
    <CustomWrapper
      {...props}
      ref={ref}
    >
      <div className={`${!props.editMode ? "playMode" : ""} richTextContainer`}>
        <div className={`RichEditor-root`}>
          <div>
            <Editor
              ref={editorRef}
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={handleKeyCommand}
              keyBindingFn={mapKeyToEditorCommand}
              onChange={setEditorState}
              placeholder={t("edit.richText.placeholder")}
              spellCheck={false}
            />
          </div>
          {props.selected && (
            <>
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
                        if (type.label === "FontSize" ||
                          type.label === "FontFamily" ||
                          type.label === "FontColor") {
                          return;
                        }
                        e.preventDefault();
                        toggleInlineStyle(type.style);
                      }}>
                      {{
                        Bold: <img src={iconPaths.bold} />,
                        Italic: <img src={iconPaths.italic} />,
                        Underline: <img src={iconPaths.underline} />,
                        FontSize: <>
                          <div className="customDropdown" ref={fontSizeRef}>
                            {fontSizeMenuOpen && (
                              <div className="dropdownMenu">
                                <button onClick={(e) => fontSizeBtn(e, type)}>72</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>60</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>48</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>36</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>30</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>24</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>18</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>14</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>12</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>10</button>
                                <button onClick={(e) => fontSizeBtn(e, type)}>8</button>
                              </div>
                            )}
                            <div className="dropdownBtn" onClick={() => {
                              setFontSizeMenuOpen(!fontSizeMenuOpen);
                            }}>
                              <img id="fontSizeIcon" src={iconPaths.fontSize} />
                            </div>
                          </div>
                        </>,
                        FontFamily: <>
                          <div className="customDropdown" ref={fontFamilyRef}>
                            {fontFamilyMenuOpen && (
                              <div className="dropdownMenu fontFamily">
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Arial" }}
                                >
                                  Arial
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Tahoma" }}
                                >
                                  Tahoma
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Times New Roman" }}
                                >
                                  Times New Roman
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Georgia" }}
                                >
                                  Georgia
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Garamond" }}
                                >
                                  Garamond
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Courier New" }}
                                >
                                  Courier New
                                </button>
                                <button
                                  onClick={(e) => fontFamilyBtn(e, type)}
                                  style={{ fontFamily: "Brush Script MT" }}
                                >
                                  Brush Script MT
                                </button>
                              </div>
                            )}
                            <div className="dropdownBtn" onClick={() => {
                              setFontFamilyMenuOpen(!fontFamilyMenuOpen);
                            }}>
                              {t("edit.richText.fontFamily")}
                            </div>
                          </div>
                        </>,
                        FontColor: <>
                          <div className="customDropdown" ref={fontColorRef}>
                            {fontColorMenuOpen && (
                              <div className="dropdownMenu fontColor">
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: BLACK }}
                                >
                                  {t("edit.richText.black")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: GREY }}
                                >
                                  {t("edit.richText.grey")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: GREEN }}
                                >
                                  {t("edit.richText.green")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: BLUE }}
                                >
                                  {t("edit.richText.blue")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: RED }}
                                >
                                  {t("edit.richText.red")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: ORANGE }}
                                >
                                  {t("edit.richText.orange")}
                                </button>
                                <button
                                  onClick={(e) => fontColorBtn(e, type)}
                                  style={{ color: YELLOW }}
                                >
                                  {t("edit.richText.yellow")}
                                </button>
                              </div>
                            )}
                            <div className="dropdownBtn" onClick={() => {
                              setFontColorMenuOpen(!fontColorMenuOpen);
                            }}>
                              <img id="fontSizeIcon" src={iconPaths.fontColor} />
                            </div>
                          </div>
                        </>
                      }[type.label] ||
                        type.label}
                    </span>
                  );
                })}
              </div>
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
                      {{
                        Center: <img src={iconPaths.alignCenter} />,
                        Left: <img src={iconPaths.alignLeft} />,
                        Right: <img src={iconPaths.alignRight} />,
                        Justified: <img src={iconPaths.alignJustify} />,
                        UL: <img src={iconPaths.bulletList} />,
                        OL: <img src={iconPaths.orderedList} />
                      }[type.label] ||
                        type.label}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </CustomWrapper>
  );
});

export default RichText;
