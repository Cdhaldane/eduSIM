import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { supabase } from '../Supabase.js'
import Loading from "../Loading/Loading";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Modal from "react-modal";


const ProtectedRoute = (props) => {
  // return (
  //   <Route
  //     component={withAuthenticationRequired(props.render, {
  //       onRedirecting: () => <Loading />,
  //     })}
  //   />
  // );

  
}

export default ProtectedRoute;
