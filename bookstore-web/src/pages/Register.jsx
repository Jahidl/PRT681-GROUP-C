import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../lib/api";

export default function Register() {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const [emailAddress, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setMsg("");

    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setErr("Passwords do not match."); return; }

    setBusy(true);
    try {
      await register({ firstName, lastName, phoneNumber, emailAddress, password, confirmPassword });
      setMsg("Registered successfully. You can sign in now.");
      setTimeout(() => navigate("/login"), 900);
    } catch (e) {
      setErr(e.message || "Registration failed.");
    } finally { setBusy(false); }
  }

  return (
    <div style={{maxWidth: 520, margin: "60px auto"}}>
      <h1>Register</h1>
      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <label><div>First name</div><input value={firstName} onChange={e=>setFirst(e.target.value)} required /></label>
        <label><div>Last name</div><input value={lastName} onChange={e=>setLast(e.target.value)} required /></label>
        <label><div>Phone number (optional)</div><input value={phoneNumber} onChange={e=>setPhone(e.target.value)} /></label>
        <label><div>Email address</div><input type="email" value={emailAddress} onChange={e=>setEmail(e.target.value)} required /></label>
        <label><div>Password (min 6)</div><input type="password" value={password} onChange={e=>setPwd(e.target.value)} required /></label>
        <label><div>Confirm password</div><input type="password" value={confirmPassword} onChange={e=>setConfirm(e.target.value)} required /></label>
        <button disabled={busy}>{busy ? "Creating..." : "Create account"}</button>
        {err && <p style={{color:"crimson"}}>{err}</p>}
        {msg && <p style={{color:"seagreen"}}>{msg}</p>}
      </form>
      <p style={{marginTop:12}}>Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
