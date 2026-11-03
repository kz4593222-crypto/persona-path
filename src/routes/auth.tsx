import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { saveFitnessProfile } from "@/lib/account.functions";
import { clearPendingPlan, readPendingPlan } from "@/lib/pending-plan";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Sign in — Your 30-Day Fitness Plan" },
    { name: "description", content: "Sign in or create an account to save your 30-day plan and join the community." },
    { property: "og:title", content: "Sign in — Your 30-Day Fitness Plan" },
    { property: "og:description", content: "Save your plan, track recovery and chat with the community." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="auth-google-mark"><path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1a5.9 5.9 0 0 1 0-11.8c1.84 0 3.07.78 3.77 1.45l2.57-2.48A9.6 9.6 0 0 0 12 2.4a9.6 9.6 0 1 0 0 19.2c5.54 0 9.2-3.9 9.2-9.38 0-.63-.07-1.1-.15-1.12Z" /></svg>;
}

function AuthPage() {
  const navigate = useNavigate();
  const save = useServerFn(saveFitnessProfile);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const finishing = useRef(false);
  const pending = typeof window === "undefined" ? null : readPendingPlan();

  const finish = async () => {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    const plan = readPendingPlan();
    try {
      if (plan) { await save({ data: plan }); clearPendingPlan(); }
      await navigate({ to: "/dashboard", replace: true });
    } catch {
      finishing.current = false;
      setBusy(false);
      setError("Your plan could not be saved. Please try again.");
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) void finish(); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void finish();
    });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: name.trim() } } });
      setBusy(false);
      if (signUpError) return setError(signUpError.message);
      if (!data.session) setNotice("Check your email and tap the confirmation link to finish creating your account.");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setBusy(false); setError(signInError.message === "Invalid login credentials" ? "Email or password is incorrect." : signInError.message); }
  };

  const google = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) setError("Google sign-in did not finish. Please try again.");
  };

  return <main className="auth-page">
    <header className="plan-topbar">
      <Button variant="ghost" size="icon" asChild><Link to="/" aria-label="Back to start" title="Back to start"><ArrowLeft /></Link></Button>
    </header>
    <p className="plan-eyebrow">{pending ? "Your plan is ready" : "Welcome"}</p>
    <h1 className="auth-title">{mode === "signup" ? "Save your plan" : "Welcome back"}</h1>
    <p className="auth-lead">Create a free account to keep your 30-day plan, get your recovery guide and chat with the community.</p>

    <Button type="button" variant="outline" className="auth-google" onClick={google} disabled={busy}><GoogleMark />Continue with Google</Button>
    <div className="auth-divider"><span>or with email</span></div>

    <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <div className="auth-field"><Label htmlFor="auth-name">Your name</Label><Input id="auth-name" required minLength={2} maxLength={40} value={name} onChange={event => setName(event.target.value)} autoComplete="name" /></div>}
      <div className="auth-field"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" /></div>
      <div className="auth-field"><Label htmlFor="auth-password">Password</Label><Input id="auth-password" type="password" required minLength={6} value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {notice && <p className="auth-notice" role="status"><Mail aria-hidden="true" />{notice}</p>}
      <Button type="submit" variant="next" disabled={busy}>{busy ? <Loader2 className="plan-loading-spin" /> : null}{mode === "signup" ? "Create account" : "Sign in"}</Button>
    </form>
    <p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New here?"} <Button variant="link" type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setNotice(""); }}>{mode === "signup" ? "Sign in" : "Create account"}</Button></p>
  </main>;
}
