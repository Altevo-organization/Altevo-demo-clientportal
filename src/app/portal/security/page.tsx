import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Shield,
  Smartphone,
  Monitor,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default async function SecurityPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session, account } = sessionData;

  // Fetch active sessions and recent logins
  const [activeSessions, recentLogins] = await Promise.all([
    prisma.session.findMany({
      where: {
        clientAccountId: account.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: {
        actorId: account.id,
        action: "login",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Sécurité" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Centre de sécurité</h1>
        <p className="text-muted-foreground mt-1">
          Gérez la sécurité de votre compte et surveillez l&apos;accès
        </p>
      </div>

      {/* Security overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Mot de passe</p>
              <p className="text-xs text-muted-foreground">Conforme aux exigences</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">2FA</p>
              <p className="text-xs text-muted-foreground">Bientôt disponible</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Sessions actives</p>
              <p className="text-xs text-muted-foreground">{activeSessions.length} session(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Sessions actives
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Appareils actuellement connectés à votre compte
          </p>
        </div>
        <div className="divide-y">
          {activeSessions.map((s, index) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {s.userAgent?.includes("Chrome")
                      ? "Google Chrome"
                      : s.userAgent?.includes("Firefox")
                        ? "Mozilla Firefox"
                        : s.userAgent?.includes("Safari")
                          ? "Safari"
                          : "Navigateur web"}
                    {index === 0 && (
                      <Badge variant="success" className="ml-2">Session actuelle</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP: {s.ipAddress || "—"} · Créée le {format(s.createdAt, "d MMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
              {index > 0 && (
                <button className="rounded-md border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                  Révoquer
                </button>
              )}
            </div>
          ))}
          {activeSessions.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune session active
            </div>
          )}
        </div>
      </div>

      {/* Recent logins */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Connexions récentes
          </h2>
        </div>
        <div className="divide-y">
          {recentLogins.map((login) => {
            let metadata: Record<string, string> = {};
            try {
              metadata = JSON.parse(login.metadata);
            } catch {}
            return (
              <div key={login.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Connexion réussie
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IP: {login.ipAddress || "—"}
                      {metadata.browser && ` · ${metadata.browser}`}
                    </p>
                  </div>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(login.createdAt, "d MMM yyyy, HH:mm", { locale: fr })}
                </time>
              </div>
            );
          })}
        </div>
      </div>

      {/* Password policy */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Politique de sécurité
          </h2>
        </div>
        <div className="p-4 space-y-3">
          {[
            { text: "Mot de passe d'au moins 8 caractères", ok: true },
            { text: "Sessions expirées automatiquement après 7 jours", ok: true },
            { text: "Journalisation de toutes les actions sensibles", ok: true },
            { text: "Isolation complète des données par organisation", ok: true },
            { text: "Authentification à deux facteurs (2FA)", ok: false },
            { text: "Chiffrement des documents côté client", ok: false },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-3">
              {rule.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              )}
              <span className="text-sm">{rule.text}</span>
              {!rule.ok && (
                <Badge variant="warning" className="ml-auto">Bientôt</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
