import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api";
import { useAuth } from "../store/auth";

export default function Login() {
  const [emailAddress, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const setToken = useAuth((s) => s.setToken);
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
    <div className="min-h-screen relative grid place-items-center px-4 py-10
                    bg-gradient-to-br from-amber-50 via-stone-50 to-indigo-50">
      {/* soft accent blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-2xl border border-stone-200 bg-white/90 shadow-xl backdrop-blur">
          {/* Header / brand */}
          <div className="px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-2xl">
                📚
              </div>
              <div>
                <h1 className="text-xl font-semibold text-stone-900">TopEnd Bookshop</h1>
                <p className="text-stone-500 text-sm">Sign in to your account</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Email address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2
                           text-stone-900 shadow-sm outline-none
                           focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPwd(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2
                           text-stone-900 shadow-sm outline-none
                           focus:border-stone-400 focus:ring-4 focus:ring-amber-200/60"
              />
            </div>

            {err && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {err}
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
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-sm text-stone-600">
              New here?{" "}
              <Link to="/register" className="font-medium text-amber-700 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
