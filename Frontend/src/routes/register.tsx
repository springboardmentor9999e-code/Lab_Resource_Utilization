import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchableSelect } from "@/components/searchable-select";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth";
import { apiErrorMessage } from "@/services/api";
import { listInstitutions, type Institution } from "@/services/referenceService";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({
    meta: [
      { title: "Create your LabGrid account" },
      {
        name: "description",
        content:
          "Register for LabGrid to book lab equipment, join waitlists and track utilisation across your institution.",
      },
      { property: "og:title", content: "Create your LabGrid account" },
      {
        property: "og:description",
        content: "Register for LabGrid to book lab equipment and track utilisation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const institutions = useApi<Institution[]>(listInstitutions, []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("1");
  const [institutionMode, setInstitutionMode] = useState<"existing" | "new">("existing");
  const [institutionId, setInstitutionId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    const rid = Number(roleId);
    if (!rid || Number.isNaN(rid))
      return toast.error("Role ID must be a number matching the backend `roles` table");
    if (institutionMode === "existing" && !institutionId)
      return toast.error("Please select an institution");
    if (institutionMode === "new" && !institutionName.trim())
      return toast.error("Please enter an institution name");

    setSubmitting(true);
    try {
      const res = await register({
        firstName,
        lastName,
        email,
        password,
        phone: phone || undefined,
        roleId: rid,
        ...(institutionMode === "existing"
          ? { institutionId: Number(institutionId) }
          : { institutionName: institutionName.trim() }),
      });
      toast.success(res.message || "Registration successful. Please sign in.");
      navigate({ to: "/login", replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join your institution's lab network">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="fn">First name</Label>
            <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ln">Last name</Label>
            <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rid">Role ID</Label>
          <Input id="rid" type="number" min={1} value={roleId} onChange={(e) => setRoleId(e.target.value)} required />
          <p className="text-[10px] text-muted-foreground">
            Must match a row in the backend <code>roles</code> table.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border p-3">
          <Label>Institution</Label>
          <RadioGroup
            value={institutionMode}
            onValueChange={(v) => setInstitutionMode(v as "existing" | "new")}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="existing" id="inst-existing" />
              <Label htmlFor="inst-existing" className="text-sm font-normal">Select existing</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="new" id="inst-new" />
              <Label htmlFor="inst-new" className="text-sm font-normal">Create new</Label>
            </div>
          </RadioGroup>

          {institutionMode === "existing" ? (
            <div className="space-y-1">
              <SearchableSelect
                value={institutionId}
                onChange={setInstitutionId}
                placeholder={institutions.loading ? "Loading institutions…" : "Select institution"}
                searchPlaceholder="Search institutions..."
                emptyText="No institutions found."
                options={(institutions.data ?? []).map((i) => ({
                  value: String(i.institutionId),
                  label: i.name,
                }))}
              />
              {institutions.error && (
                <p className="text-[10px] text-destructive">
                  Could not load institutions ({institutions.error}). Switch to “Create new” to
                  register with a new institution.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <Input
                id="inst-name"
                placeholder="e.g. Indian Institute of Science"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                The institution is created automatically if it does not already exist.
              </p>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
