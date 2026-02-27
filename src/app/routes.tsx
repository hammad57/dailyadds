import { createBrowserRouter } from "react-router";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import LoginSignup from "./pages/LoginSignup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Index,
  },
  {
    path: "/admin",
    Component: Admin,
  },
  {
    path: "/login",
    Component: LoginSignup,
  },
]);
