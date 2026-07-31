import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/async-state";
import { useApi } from "@/hooks/use-api";
import { useAuth, ROLE_LABEL } from "@/lib/auth";
import { listInstitutions, institutionMap, type Institution } from "@/services/referenceService";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "My Profile · LabGrid" },
      {
        name: "description",
        content: "View your LabGrid account details, institution and assigned platform role.",
      },
      { property: "og:title", content: "My Profile · LabGrid" },
      {
        property: "og:description",
        content: "View your LabGrid account details, institution and assigned platform role.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value || "—"} readOnly className="bg-muted/40" />
    </div>
  );
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const institutions = useApi<Institution[]>(listInstitutions, []);
  const instNames = useMemo(() => institutionMap(institutions.data), [institutions.data]);

  if (loading || !user) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your account details as stored on the platform." />

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <Badge variant="secondary">{ROLE_LABEL[user.role]}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name" value={user.firstName} />
          <Field label="Last name" value={user.lastName} />
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={user.phone} />
          <Field
            label="Institution"
            value={
              user.institutionId
                ? (instNames.get(user.institutionId) ?? `#${user.institutionId}`)
                : undefined
            }
          />
          <Field label="Department" value={undefined} />
          <Field label="Role" value={ROLE_LABEL[user.role]} />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Profile editing is not available yet: the backend exposes user updates only to System
          and Institution Admins (PUT /api/users/&#123;id&#125;) and does not return a department
          for the signed-in user.
        </p>
      </div>
    </div>
  );
}
