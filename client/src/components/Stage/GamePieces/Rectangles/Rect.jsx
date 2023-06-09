import React, { forwardRef, useContext, useState, useEffect } from "react";
import { Rect } from "react-konva";
import CustomWrapper from "../CustomWrapper";
import styled from "styled-components";
import { SettingsContext } from "../../../../App";

const Wrapper = styled.div`
  & > * {
    font-size: ${p => p.textsize || '1'}em;
  }
`;

const Rectangle = forwardRef((props, ref) => {
    const { settings } = useContext(SettingsContext);

    console.log(props)
    return (
        <>
            <Rect {...settings} {...props} />
            {props.name}
        </>
    );
});

export default Rectangle;
