import { withAuth0 } from "@auth0/auth0-react";
import AuthenticationButton from "./authentication-button"

export const MenuItems =[
  {
    title: "Home",
    url: "/",
    cName: "nav-links"
  },
  {
    title: "Profile",
    url: "/profile",
    cName:"nav-links"
  },
  {
    title: "Dahsboard",
    url: "/dashboard",
    cName:"nav-links"
  },
  {
    title: "Login",
    url: "/" ,
    cName:"nav-links-mobile"
  }

]
