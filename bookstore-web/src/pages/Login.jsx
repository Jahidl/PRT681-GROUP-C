import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Login() {
  const [emailAddress, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const setToken = useAuth(s => s.setToken);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const { accessToken } = await login({ emailAddress, password });
      setToken(accessToken);
      navigate("/");
    } catch (e) {
      setErr(e.message || String(e));
    } finally { setBusy(false); }
  }

  return (
    <div style={{maxWidth: 420, margin: "60px auto"}}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <label>
          <div>Email address</div>
          <input type="email" value={emailAddress} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>
          <div>Password</div>
          <input type="password" value={password} onChange={e=>setPwd(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        {err && <p style={{color:"crimson"}}>{err}</p>}
      </form>
      <p style={{marginTop:12}}>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
