
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { ChromePicker } from 'react-color';

import { useTranslation } from "react-i18next";

import Stars from "../../../../public/icons/star.svg"
import Buttons from "../../../../public/icons/pointer-top.svg"
import Rectangles from "../../../../public/icons/stop.svg"
import Circles from "../../../../public/icons/circle.svg"
import Texts from "../../../../public/icons/text.svg"
import Triangles from "../../../../public/icons/triangle-9.svg"



const Themes = (props) => {
    const { t } = useTranslation();
    const [inputFillColor, setInputFillColor] = useState("#000000");
    const [shapeColor, setShapeColor] = useState("#000000");
    const [themes, setThemes] = useState(["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]);
    const [shapeThemes, setShapeThemes] = useState([["#000000", "#000000"], ["#000000", "#000000", "fffffff"], ["#000000", "#000000"], ["#000000", "#000000"], ["#ffffff", "#000000", "#000000"], ["#000000", "#000000"]]);
    const shapes = [<Rectangles />, <Circles />, <Triangles />, <Stars />, <Buttons />, <Texts />]; // buttons, text
    const [index, setIndex] = useState(0);
    const [shapeIndex, setShapeIndex] = useState(0);
    const [shapeType, setShapeType] = useState('fill'); // fill, stroke

    useEffect(() => {
        // if(typeof props.shapeThemes !== "array") props.setShapeThemes(["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"])
        if (props.themes.length !== 0) setThemes(props.themes);
        if (props.shapeThemes.length !== 0 && Array.isArray(props.shapeThemes)) setShapeThemes(props.shapeThemes);
    }, [props])


    const getThemesBoxes = () => {
        return themes.map((theme, i) => {
            return (
                <div className="theme-box" key={i} onClick={() => {
                    setIndex(i)
                }}>
                    <div className={"theme-box-color " + (i === index ? "selected" : "")} style={{ backgroundColor: theme }}></div>
                </div>
            )
        })
    }

    const getShapesDropdown = () => {
        return shapes.map((shape, i) => {
            return (
                <div className="shape-box" style={{ backgroundColor: shapeThemes[i][0] }} key={i} onClick={() => {
                    setShapeIndex(i)
                }}>
                    <div
                        className={"shape-box-color " + (i === shapeIndex ? "selected" : "")}
                        style={{ borderColor: shapeThemes[i][1], backgroundColor: shapeThemes[i][0], fill: shapeThemes[i][2] ? shapeThemes[i][2] : '#ffffff' }}>
                        {shape}
                    </div>
                </div>
            )
        })
    }

    return (
        <div className="themes-container">
            <div className="main-theme">
                <div className="theme-title">Themes</div>
                <hr />
                <div className="theme-boxes">
                    {getThemesBoxes()}
                </div>
                <ChromePicker
                    className="theme-color-picker"
                    color={inputFillColor}
                    disableAlpha={true}
                    onChange={(color) => {
                        setInputFillColor(color.hex);
                        let newThemes = [...themes];
                        newThemes[index] = color.hex;
                        setThemes(newThemes);
                        props.setThemes(newThemes);
                    }} />
            </div>
            <div className="shape-theme">
                <div className="theme-title">Shapes</div>
                <hr />
                <div className="shape-boxes">
                    {getShapesDropdown()}
                </div>
                <div className="theme-buttons">
                    <button className={shapeType === 'fill' ? "theme-button-selected" : ''} onClick={() => setShapeType('fill')}>Fill</button>
                    <button className={shapeType === 'stroke' ? "theme-button-selected" : ''} onClick={() => setShapeType('stroke')}>Stroke</button>
                    {shapeIndex === 4 && <button className={shapeType === 'text' ? "theme-button-selected" : ''} onClick={() => setShapeType('text')}>Text</button>}
                </div>
                <ChromePicker
                    className="theme-color-picker"
                    color={shapeColor}
                    disableAlpha={true}
                    onChange={(color) => {
                        let type;
                        if (shapeType === 'fill') type = 0;
                        else if (shapeType === 'stroke') type = 1;
                        else type = 2;
                        setShapeColor(color.hex);
                        let newThemes = [...shapeThemes];
                        if (!Array.isArray(newThemes[shapeIndex])) newThemes[shapeIndex] = ["#ffffff", "#ffffff"];
                        newThemes[shapeIndex][type] = color.hex;
                        setShapeThemes(newThemes);
                        props.setShapeThemes(newThemes);
                    }} />
            </div>
        </div>
    );
}

export default Themes;
