import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthGuard from "./components/auth-guard";
import PageTitle from "./components/page-title";

import PublicLayout from "./layouts/public-layout";
import AppLayout from "./layouts/app-layout";
import AuthLayout from "./layouts/auth-layout";

import Welcome from "./pages/welcome";
import Solutions from "./pages/services/public-information/solutions";
import About from "./pages/services/public-information/about";
import Contact from "./pages/services/public-information/contact";

import Login from "./pages/auth/login";
import ForgotPassword from "./pages/auth/forgot-password";
import ResetPassword from "./pages/auth/reset-password";
import Register from "./pages/auth/register";

import Dashboard from "./pages/dashboard";

import BlogPostDashboard from "./pages/services/blog-fcv/dashboard";
import CreateContentPage from "./pages/services/blog-fcv/contents/create-content";
import ContentsPage from "./pages/services/blog-fcv/contents/content-dashboard";
import EditContentPage from "./pages/services/blog-fcv/contents/edit-content";

import UserManagement from "./pages/services/admin/users/dashboard";
import CreateUser from "./pages/services/admin/users/create-user";
import EditUser from "./pages/services/admin/users/edit-user";

import UserPermissions from "./pages/services/admin/permission/user-permission";

import NotFound from "./pages/error/404";

export default function App() {
  return (
    <BrowserRouter>
      <PageTitle />

      <Routes>
        {/* =====================================================
            PUBLIC
        ===================================================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* =====================================================
            AUTHENTICATED APPLICATION
        ===================================================== */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/create-user" element={<CreateUser />} />
            <Route path="/admin/edit-user/:id" element={<EditUser />} />
            <Route path="/admin/user-permissions/:id" element={<UserPermissions />} />

            {/* Blog */}
            <Route path="/blog-dashboard" element={<BlogPostDashboard />} />

            <Route path="/blog/contents" element={<ContentsPage />} />

            <Route
              path="/blog/create-content"
              element={<CreateContentPage />}
            />

            <Route
              path="/blog/edit-content/:id"
              element={<EditContentPage />}
            />
          </Route>
        </Route>

        {/* =====================================================
            404
        ===================================================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
