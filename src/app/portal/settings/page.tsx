import { getSessionWithAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/rbac";
import { User, Mail, Building2, Shield, Bell, Eye } from "lucide-react";

export default async function SettingsPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { account } = sessionData;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Paramètres" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre profil et vos préférences
        </p>
      </div>

      {/* Profile card */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Profil</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6">
            <Avatar name={account.name} size="lg" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{account.name}</h3>
              <p className="text-sm text-muted-foreground">{account.email}</p>
              <Badge variant={account.role === "admin" ? "warning" : "default"}>
                {getRoleLabel(account.role)}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Nom complet
              </label>
              <input
                type="text"
                value={account.name}
                className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Adresse e-mail
              </label>
              <input
                type="email"
                value={account.email}
                className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Organisation
              </label>
              <input
                type="text"
                value={account.organization.name}
                className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Rôle
              </label>
              <input
                type="text"
                value={getRoleLabel(account.role)}
                className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification preferences (mock) */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h2>
        </div>
        <div className="p-4 space-y-4">
          {[
            { label: "Nouveau document partagé", description: "Recevez un e-mail quand un document est ajouté", enabled: true },
            { label: "Mise à jour de demande", description: "Soyez informé des changements de statut", enabled: true },
            { label: "Nouveau message", description: "Recevez une alerte pour chaque nouveau message", enabled: false },
            { label: "Rapport de sécurité hebdomadaire", description: "Résumé des activités sur votre compte", enabled: true },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.description}</p>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
                  pref.enabled ? "bg-foreground" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    pref.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance (mock) */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Apparence
          </h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Thème</p>
              <p className="text-xs text-muted-foreground">Choisissez l&apos;apparence du portail</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border bg-white px-3 py-1.5 text-xs font-medium shadow-sm ring-2 ring-foreground cursor-pointer">
                Clair
              </button>
              <button className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-pointer">
                Sombre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
