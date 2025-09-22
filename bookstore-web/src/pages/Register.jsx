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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");

    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setErr("Passwords do not match."); return; }

    setBusy(true);
    try {
      await register({ firstName, lastName, phoneNumber, emailAddress, password, confirmPassword });
      setMsg("Registered successfully. You can sign in now.");
      setTimeout(() => navigate("/login"), 900);
    } catch (e: any) {
      setErr(e.message || "Registration failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-amber-50/70 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand / header */}
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-amber-900 shadow">
            <span className="text-xl font-bold">📚</span>
          </div>
          <h1 className="mt-3 text-3xl font-serif text-stone-800">Create your account</h1>
          <p className="mt-1 text-sm text-stone-500">
            Join our bookstore to track orders & wishlists.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-stone-200 bg-white/95 p-6 shadow-lg backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">First name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={firstName}
                  onChange={(e) => setFirst(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Last name</span>
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={lastName}
                  onChange={(e) => setLast(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Phone (optional)</span>
              <input
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={phoneNumber}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 0400 000 000"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-stone-700">Email address</span>
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                value={emailAddress}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Password (min 6)</span>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={password}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Confirm password</span>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder-stone-400 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </label>
            </div>

            {/* alerts */}
            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}
            {msg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {msg}
              </div>
            )}

            <button
              disabled={busy}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-white shadow-md transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-amber-700 underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
