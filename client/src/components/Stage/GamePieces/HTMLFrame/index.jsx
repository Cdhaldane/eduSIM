import React, { useMemo, forwardRef, useEffect, useRef } from "react";
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

  const iframeRef = useRef();

  useEffect(() => {
    if (props.varEnable) {
      window.addEventListener('message', event => {
        if (props.iframeSrc.startsWith(event.origin)) { 
          sessionStorage.setItem("iframe_"+event.data?.name,event.data?.value); 
        }
      });
    }
    let interval;
    if (props.varName && props.varInterval) {
      interval = setInterval(() => {
        if (iframeRef.current) {
          let vars = props.varName.split(',').reduce((a,v) => ({
            ...a,
            [v]: sessionStorage[`iframe_${v}`]
          }), {});
          iframeRef.current.contentWindow.postMessage(vars, "*");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, []); 
  
  const onLoad = () => {
    if (iframeRef.current && props.varName) {
      let vars = props.varName.split(',').reduce((a,v) => ({
        ...a,
        [v]: sessionStorage[`iframe_${v}`]
      }), {});
      iframeRef.current.contentWindow.postMessage(vars, "*");
    }
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <HTMLWrapper padded={!props.iframeSrc} width={props.containerWidth} height={props.containerHeight}>
      {props.iframeSrc 
        ? <iframe src={props.iframeSrc} height="100%" width="100%" style={{border: 'none'}} ref={iframeRef} onLoad={onLoad} />
        : <div dangerouslySetInnerHTML={{__html: sanitizedHTML}} />
      }
      </HTMLWrapper>
    </CustomWrapper>
  );
});

export default HTMLFrame;
