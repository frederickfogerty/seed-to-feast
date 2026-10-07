import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Plot & Plan" },
      { name: "description", content: "Sign in to save and revisit your garden plans season after season." },
      { property: "og:title", content: "Sign in — Plot & Plan" },
      { property: "og:description", content: "Save and revisit your garden plans season after season." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/plans" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
      });
      if (error) toast.error(error.message);
      else setSent(true);
    }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="paper rounded-xl p-6 sm:p-8">
        <h1 className="text-3xl">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save your plans and come back to them every season.
        </p>
        {sent ? (
          <p className="mt-6 rounded-lg bg-secondary/70 p-4 text-sm">
            Check your inbox — click the link we sent to {email} to confirm your account, then sign in.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "up" && (
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" maxLength={60} />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2" />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "in" ? "Sign in" : "Create account"}
            </Button>
          </form>
        )}
        <button
          type="button"
          className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setSent(false);
          }}
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
