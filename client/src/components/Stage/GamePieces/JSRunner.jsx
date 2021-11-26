// !!!!!! WARNING: THIS IS STUPIDLY DANGEROUS !!!!!!
//
// this will probably not last very long outside of
// pat's testing purposes. the ability for anybody
// to execute javascript freely should not be passed
// into production. this is built on the client-side so
// only pat is able to see this, but regardless, GET RID of
// this as soon as you can!!

import React, { forwardRef } from "react";
import CustomWrapper from "./CustomWrapper";

const JSRunner = forwardRef((props, ref) => {

  if (localStorage.adminid !== "11b8ef66-452f-41dd-b00c-e163fb5b49b0") {
    return null;
  }

  return (
    <CustomWrapper {...props} ref={ref}>
      <button onClick={() => eval(props.text)} style={{transform: "translateY(-30px)"}}>run this as javascript</button>
    </CustomWrapper>
  );
});

export default JSRunner;
