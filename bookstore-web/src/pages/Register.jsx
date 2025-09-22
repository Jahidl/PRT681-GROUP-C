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
    <div className="min-h-screen relative grid place-items-center px-4 py-10
                    bg-gradient-to-br from-amber-50 via-stone-50 to-indigo-50">
      {/* soft blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="rounded-2xl border border-stone-200 bg-white/90 shadow-xl backdrop-blur">
          {/* Header */}
          <div className="px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-2xl">📚</div>
              <div>
                <h1 className="text-xl font-semibold text-stone-900">TopEnd Bookshop</h1>
                <p className="text-stone-500 text-sm">Create your account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">First name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                             focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                  value={firstName}
                  onChange={(e) => setFirst(e.target.value)}
                  maxLength={100}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Last name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                             focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                  value={lastName}
                  onChange={(e) => setLast(e.target.value)}
                  maxLength={100}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Phone number (optional)</label>
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                           focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                value={phoneNumber}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                autoComplete="tel"
                placeholder="e.g. 04xx xxx xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Email address</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                           focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                value={emailAddress}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={256}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Password (min 6)</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                             focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                  value={password}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Confirm password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm outline-none
                             focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
                  value={confirmPassword}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {err && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {err}
              </p>
            )}
            {msg && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700" role="status">
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center rounded-lg
                         bg-stone-900 px-4 py-2.5 text-white font-medium
                         hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-stone-300"
            >
              {busy ? "Creating..." : "Create account"}
            </button>

            <p className="text-sm text-stone-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-amber-700 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
