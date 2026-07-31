import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, ROLE_HOME } from "@/lib/auth";
import { apiErrorMessage } from "@/services/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: ROLE_HOME[user.role], replace: true });
  }, [user, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");
    setSubmitting(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name}`);
      navigate({ to: ROLE_HOME[u.role], replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Invalid email or password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Access your lab resource dashboard">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@institution.edu"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to LabGrid? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
