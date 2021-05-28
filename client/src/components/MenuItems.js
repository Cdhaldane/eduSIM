import React from "react";
import { withAuth0 } from "@auth0/auth0-react";


export const MenuItems =
  [
  {
    title: "Home",
    url: "/",
    cName: "nav-links"
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    cName:"nav-links"
  },
  {
    title: "Game Page",
    url: "/gamepage",
    cName:"nav-links"
  },
  {
    title:"",
    cName:"nav-pic"
  },
  {
    title: "Login",
    url: "/dashboard" ,
    cName:"nav-links-mobile"
  }

]
