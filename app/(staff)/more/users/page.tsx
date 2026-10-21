"use client";

import { roleChip, useCurrentUser } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { BackLink, Note } from "@/components/admin/common";
import { InviteForm, PermissionMatrix, StaffList } from "@/components/admin/users";

export default function UsersPage() {
  const { userId, role, staff: me } = useCurrentUser();
  const isAdmin = role === "admin";

  return (
    <div className="flex flex-col gap-5">
      <BackLink />
      <PageHeader title="Users and roles" caption="Access control and practice permissions" avatar={me?.avatar} role={roleChip(role)} />

      {!isAdmin && <Note>Read-only. Only the practice admin can invite users or change access.</Note>}

      <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
        <div className="space-y-5">
          {isAdmin && <InviteForm />}
          {userId && <StaffList canEdit={isAdmin} userId={userId} />}
        </div>
        <PermissionMatrix />
      </div>
    </div>
  );
}
