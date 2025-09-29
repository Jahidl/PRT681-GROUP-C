import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, loginUser } from "../lib/auth"; // uses VITE_API_BASE_URL

const btnYellow = { backgroundColor: "#f0c14b", borderColor: "#a88734" };
const linkBlue = { color: "#007185" };

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      // 1) Register the user
      await registerUser(form);

      // 2) Auto-login using the same credentials
      const data = await loginUser(form.emailAddress, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.emailAddress,
        })
      );
      window.dispatchEvent(new Event("auth-changed"));
      nav("/");
    } catch (ex) {
      setErr(typeof ex === "string" ? ex : ex.message || "Registration failed");
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
            width: 420,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ fontSize: 22, marginBottom: 12 }}>Create account</h1>

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

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={label}>First name</label>
              <input
                style={input}
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label style={label}>Last name</label>
              <input
                style={input}
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <label style={{ ...label, marginTop: 10 }}>Phone (optional)</label>
          <input
            style={input}
            value={form.phoneNumber}
            onChange={(e) => set("phoneNumber", e.target.value)}
            placeholder="04xxxxxxxx"
          />

          <label style={{ ...label, marginTop: 10 }}>Email</label>
          <input
            style={input}
            value={form.emailAddress}
            onChange={(e) => set("emailAddress", e.target.value)}
            required
            type="email"
            placeholder="you@example.com"
          />

          <label style={{ ...label, marginTop: 10 }}>Password</label>
          <input
            style={input}
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            placeholder="At least 6 characters"
          />

          <label style={{ ...label, marginTop: 10 }}>Re-enter password</label>
          <input
            style={input}
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            required
            placeholder="Repeat password"
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
            {busy ? "Creating…" : "Create your Amazone account"}
          </button>

          <p style={{ fontSize: 13, marginTop: 14 }}>
            Already have an account?{" "}
            <Link to="/login" style={linkBlue}>
              Sign in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

const label = { display: "block", fontSize: 13, marginBottom: 4 };
const input = {
  width: "100%",
  border: "1px solid #a6a6a6",
  borderRadius: 6,
  padding: "9px 10px",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};
