import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../lib/auth"; // uses VITE_API_BASE_URL

const btnYellow = { backgroundColor: "#f0c14b", borderColor: "#a88734" };
const linkBlue = { color: "#007185" };

export default function Login() {
  const nav = useNavigate();
  const [emailAddress, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const data = await loginUser(emailAddress, password);
      // expected API response: { token, firstName, lastName, emailAddress }
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.emailAddress,
        })
      );
      window.dispatchEvent(new Event("auth-changed")); // tell navbar to refresh
      nav("/");
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#eaeded" }}>
      <header style={{ padding: "18px 0", textAlign: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>amazone</span>
      </header>

      <main style={{ display: "grid", placeItems: "start center" }}>
        <form
          onSubmit={onSubmit}
          style={{
            width: 360,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>Sign in</h1>

          {err && (
            <div
              style={{
                background: "#fef0f0",
                border: "1px solid #f0c2c2",
                color: "#a61b1b",
                borderRadius: 6,
                padding: "8px 10px",
                marginBottom: 12,
                fontSize: 14,
              }}
            >
              {err}
            </div>
          )}

          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
            Email
          </label>
          <input
            autoComplete="email"
            value={emailAddress}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            placeholder="you@example.com"
          />

          <label
            style={{ display: "block", fontSize: 13, marginBottom: 4, marginTop: 10 }}
          >
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={busy}
            style={{
              ...btnYellow,
              width: "100%",
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: 8,
              padding: "9px 12px",
              marginTop: 16,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <p style={{ fontSize: 13, marginTop: 14 }}>
            New to Amazone?{" "}
            <Link to="/register" style={linkBlue}>
              Create your Amazone account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #a6a6a6",
  borderRadius: 6,
  padding: "9px 10px",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};
