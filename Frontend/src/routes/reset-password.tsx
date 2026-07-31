import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/services/authService";
import { apiErrorMessage } from "@/services/api";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  validateSearch: (s: Record<string, unknown>) => ({ token: (s.token as string) || "" }),
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Missing reset token — open the link from your email.");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      toast.success("Password reset — please sign in");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to reset password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update password
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
