import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import appConfig from "@/config/app";
// Update in the future to use a more dynamic approach for page titles, possibly using route metadata or a context provider.
// Check the App.tsx

const pageTitles: Record<string, string> = {
  "/": "Welcome",
  "/about": "About",
  "/solutions": "Solutions",
  "/contact": "Contact",

  "/login": "Login",
  "/register": "Register",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  
  "/dashboard": "Dashboard",

  "/admin/users": "User Management",
  "/admin/create-user": "Create User",
  "/admin/edit-user": "Edit User",
  "/admin/user-permissions/:id": "User Permission",

  "/blog-dashboard": "Blog Dashboard",
  "/blog/create-content": "Create Content",
  "/blog/edit-content/:id": "Edit Content",
  "/blog/contents": "Contents",
};

export default function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = pageTitles[location.pathname];

    document.title = pageTitle
      ? `${appConfig.name} - ${pageTitle}`
      : appConfig.name;
  }, [location.pathname]);

  return null;
}
