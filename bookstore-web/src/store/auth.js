import { create } from "zustand";

export const useAuth = create((set) => ({
  token: localStorage.getItem("bookstore_token"),
  setToken: (t) => {
    if (t) localStorage.setItem("bookstore_token", t);
    else localStorage.removeItem("bookstore_token");
    set({ token: t });
  },
  logout: () => {
    localStorage.removeItem("bookstore_token");
    set({ token: null });
  }
}));
