import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function isLoggedIn() {
  // adjust if your app stores auth differently
  const token = localStorage.getItem("token");
  return Boolean(token);
}

export default function ProtectedRoute({ children }) {
  const loc = useLocation();
  if (!isLoggedIn()) {
    // send the user to login and remember where they came from
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return children;
}
