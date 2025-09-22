import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./store/auth";

function Nav() {
  const { token, logout } = useAuth();
  return (
    <nav style={{display:"flex", gap:12, padding:16, borderBottom:"1px solid #eee"}}>
      <Link to="/">Home</Link>
      <Link to="/books">Books</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/profile">Profile</Link>
      <span style={{marginLeft:"auto"}} />
      {token ? (<><span style={{fontSize:12, opacity:.7}}>Signed in</span><button onClick={logout}>Logout</button></>) : (<><Link to="/login">Login</Link><Link to="/register">Register</Link></>)}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/books" element={<Books/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </BrowserRouter>
  );
}
