import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth, AuthProvider } from "./store/auth"; // make sure AuthProvider is exported

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function Nav() {
  const { token, logout } = useAuth();

  const linkCls =
    "px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100";
  const active =
    "bg-stone-200 text-stone-900";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <NavLink to="/" end className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Home</NavLink>
        <NavLink to="/books" className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Books</NavLink>
        <NavLink to="/cart" className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Cart</NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Profile</NavLink>

        <div className="ml-auto flex items-center gap-2">
          {token ? (
            <>
              <span className="text-xs text-stone-500">Signed in</span>
              <button
                onClick={logout}
                className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => `${linkCls} ${isActive ? active : ""}`}>Register</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />

            {/* Protected routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
