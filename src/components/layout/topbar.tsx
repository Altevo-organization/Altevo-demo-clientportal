"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/rbac";
import { Building2 } from "lucide-react";

interface TopbarProps {
  userName: string;
  userRole: string;
  organizationName: string;
}

export function Topbar({ userName, userRole, organizationName }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Organization info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="font-medium text-foreground">{organizationName}</span>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{userName}</p>
          <Badge variant={userRole === "admin" ? "warning" : "default"}>
            {getRoleLabel(userRole)}
          </Badge>
        </div>
        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
}
