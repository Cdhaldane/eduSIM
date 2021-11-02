import React, { useMemo, forwardRef } from "react";
import CustomWrapper from "../CustomWrapper";
import styled from "styled-components";
import DOMPurify from 'dompurify';

const HTMLWrapper = styled.div`
  width: ${(p) => p.width ? `${p.width}px` : "auto"};
  height: ${(p) => p.height ? `${p.height}px` : "auto"};
  background-color: white;
  ${(p) => p.padded && "padding: 8px;"}
  overflow: hidden;
`;

const HTMLFrame = forwardRef((props, ref) => {

  const sanitizedHTML = useMemo(() => DOMPurify.sanitize(props.htmlValue), [props.htmlValue]);

  return (
    <CustomWrapper {...props} ref={ref}>
      <HTMLWrapper padded={!props.iframeSrc} width={props.containerWidth} height={props.containerHeight}>
      {props.iframeSrc 
        ? <iframe src={props.iframeSrc} height="100%" width="100%" />
        : <div dangerouslySetInnerHTML={{__html: sanitizedHTML}} />
      }
      </HTMLWrapper>
    </CustomWrapper>
  );
});

export default HTMLFrame;
