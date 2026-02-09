export type Role = "admin" | "user";

const PERMISSIONS = {
  admin: [
    "documents:read",
    "documents:write",
    "documents:delete",
    "requests:read",
    "requests:write",
    "requests:manage",
    "messages:read",
    "messages:write",
    "audit:read",
    "security:read",
    "security:manage",
    "settings:read",
    "settings:write",
    "organization:manage",
  ],
  user: [
    "documents:read",
    "requests:read",
    "requests:write",
    "messages:read",
    "messages:write",
    "audit:read",
    "security:read",
    "settings:read",
    "settings:write",
  ],
} as const;

type Permission = (typeof PERMISSIONS)["admin"][number];

export function hasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role as Role];
  if (!rolePermissions) return false;
  return (rolePermissions as readonly string[]).includes(permission);
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Administrateur";
    case "user":
      return "Utilisateur";
    default:
      return role;
  }
}
