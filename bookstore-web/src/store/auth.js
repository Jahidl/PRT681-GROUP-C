// src/store/auth.jsx
import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bookstore_token") || "");

  const login = (t) => { setToken(t); localStorage.setItem("bookstore_token", t); };
  const logout = () => { setToken(""); localStorage.removeItem("bookstore_token"); };

  const value = useMemo(() => ({ token, login, logout }), [token]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
