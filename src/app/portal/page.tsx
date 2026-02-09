import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { FileText, TicketCheck, MessageSquare, Shield, Clock, Download } from "lucide-react";
import { StatCard } from "@/components/portal/stat-card";
import { StatusBadge } from "@/components/portal/status-badge";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";

export default async function PortalHomePage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session, account } = sessionData;
  const orgId = session.organizationId;

  // Fetch counts and recent data in parallel
  const [documentCount, requestsData, messageCount, recentDocs, recentActivity] = await Promise.all([
    prisma.document.count({ where: { organizationId: orgId } }),
    prisma.requestTicket.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.messageThread.count({ where: { organizationId: orgId } }),
    prisma.document.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { uploadedBy: { select: { name: true } } },
    }),
    prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  const openRequests = requestsData.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const resolvedRequests = requestsData.filter((r) => r.status === "resolved" || r.status === "closed").length;

  const actionLabels: Record<string, string> = {
    login: "Connexion",
    logout: "Déconnexion",
    document_view: "Document consulté",
    document_download: "Document téléchargé",
    ticket_create: "Demande créée",
    ticket_update: "Demande mise à jour",
    message_send: "Message envoyé",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bonjour, {account.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Voici un résumé de votre espace client
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={documentCount}
          description="Documents disponibles"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Demandes en cours"
          value={openRequests}
          description={`${resolvedRequests} résolue(s)`}
          icon={<TicketCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Conversations"
          value={messageCount}
          description="Threads actifs"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatCard
          title="Sécurité"
          value="Active"
          description="Dernière connexion aujourd'hui"
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent documents */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Documents récents</h2>
            <Link href="/portal/documents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voir tout
            </Link>
          </div>
          <div className="divide-y">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="rounded-lg bg-muted p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} · {format(doc.createdAt, "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
                <Badge variant="muted">{doc.category === "contract" ? "Contrat" : doc.category === "invoice" ? "Facture" : doc.category === "report" ? "Rapport" : "Général"}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Active requests */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold">Demandes actives</h2>
            <Link href="/portal/requests" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voir tout
            </Link>
          </div>
          <div className="divide-y">
            {requestsData.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(ticket.createdAt, "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <StatusBadge status={ticket.priority} type="priority" />
                  <StatusBadge status={ticket.status} type="status" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Activité récente</h2>
          <Link href="/portal/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voir l&apos;historique complet
          </Link>
        </div>
        <div className="divide-y">
          {recentActivity.map((log) => (
            <div key={log.id} className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-muted p-2">
                {log.action === "login" || log.action === "logout" ? (
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                ) : log.action.startsWith("document") ? (
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                ) : log.action.startsWith("ticket") ? (
                  <TicketCheck className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{log.actor?.name || "Système"}</span>
                  {" — "}
                  {actionLabels[log.action] || log.action}
                </p>
              </div>
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {format(log.createdAt, "d MMM, HH:mm", { locale: fr })}
              </time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
