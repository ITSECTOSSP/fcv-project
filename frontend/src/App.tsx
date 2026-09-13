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

import BlogPostDashboard from "./pages/services/blogpost/dashboard";
import CreateContentPage from "./pages/services/blogpost/contents/create-content";
import ContentsPage from "./pages/services/blogpost/contents/content-dashboard";

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

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* =====================================================
            AUTHENTICATION
        ===================================================== */}

        <Route element={<AuthLayout />}>
          <Route path="*" element={<NotFound />} />

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
            <Route path="*" element={<NotFound />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/blog-dashboard" element={<BlogPostDashboard />} />

            <Route path="/blog/create-content" element={<CreateContentPage />} />

            <Route path="/blog/contents" element={<ContentsPage />} />
            {/* Other protected pages
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
