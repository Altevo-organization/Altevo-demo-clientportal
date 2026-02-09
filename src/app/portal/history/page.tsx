import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  LogIn,
  LogOut,
  Eye,
  Download,
  Plus,
  RefreshCw,
  Send,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const actionConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "info" | "success" | "warning" | "danger" }> = {
  login: { label: "Connexion", icon: <LogIn className="h-3.5 w-3.5" />, variant: "info" },
  logout: { label: "Déconnexion", icon: <LogOut className="h-3.5 w-3.5" />, variant: "default" },
  document_view: { label: "Document consulté", icon: <Eye className="h-3.5 w-3.5" />, variant: "default" },
  document_download: { label: "Document téléchargé", icon: <Download className="h-3.5 w-3.5" />, variant: "success" },
  ticket_create: { label: "Demande créée", icon: <Plus className="h-3.5 w-3.5" />, variant: "info" },
  ticket_update: { label: "Demande mise à jour", icon: <RefreshCw className="h-3.5 w-3.5" />, variant: "warning" },
  message_send: { label: "Message envoyé", icon: <Send className="h-3.5 w-3.5" />, variant: "success" },
};

export default async function HistoryPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session } = sessionData;

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: { select: { name: true, email: true } } },
  });

  // Group by date
  const grouped = logs.reduce(
    (acc, log) => {
      const dateKey = format(log.createdAt, "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(log);
      return acc;
    },
    {} as Record<string, typeof logs>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Historique" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Historique</h1>
        <p className="text-muted-foreground mt-1">
          Journal détaillé de toutes les actions effectuées sur votre espace
        </p>
      </div>

      {/* Audit log timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([dateKey, dayLogs]) => (
          <div key={dateKey}>
            <div className="sticky top-0 z-10 mb-3">
              <span className="inline-flex items-center rounded-md border bg-card px-3 py-1 text-xs font-medium shadow-sm">
                {format(new Date(dateKey), "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            </div>
            <div className="space-y-0">
              {dayLogs.map((log, index) => {
                const config = actionConfig[log.action] || {
                  label: log.action,
                  icon: <Activity className="h-3.5 w-3.5" />,
                  variant: "default" as const,
                };
                return (
                  <div key={log.id} className="relative flex gap-4 pb-4 last:pb-0">
                    {index < dayLogs.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                    )}
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-card">
                      {config.icon}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {log.actor?.name || "Système"}
                        </span>
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {log.ipAddress && (
                          <span className="text-xs text-muted-foreground">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {format(log.createdAt, "HH:mm:ss", { locale: fr })}
                      </time>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Les 50 dernières actions sont affichées · Les logs sont conservés conformément à notre politique de rétention
      </p>
    </div>
  );
}
