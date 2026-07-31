import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { forgotPassword } from "@/services/authService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      toast.success("If an account exists, a reset link has been sent.");
      setTimeout(() => navigate({ to: "/login" }), 800);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to request reset"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a secure reset link">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remembered it? <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
