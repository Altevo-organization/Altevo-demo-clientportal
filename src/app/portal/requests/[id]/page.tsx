import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge } from "@/components/portal/status-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, ArrowRightLeft, Plus, AlertTriangle } from "lucide-react";

const eventIcons: Record<string, React.ReactNode> = {
  created: <Plus className="h-3.5 w-3.5 text-blue-500" />,
  status_change: <ArrowRightLeft className="h-3.5 w-3.5 text-amber-500" />,
  comment: <MessageSquare className="h-3.5 w-3.5 text-green-500" />,
  priority_change: <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
};

const eventLabels: Record<string, string> = {
  created: "Demande créée",
  status_change: "Changement de statut",
  comment: "Commentaire",
  priority_change: "Changement de priorité",
};

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session } = sessionData;

  const ticket = await prisma.requestTicket.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      createdBy: { select: { name: true, email: true } },
      events: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const isOverdue = ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && ticket.status !== "resolved" && ticket.status !== "closed";

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Portail", href: "/portal" },
            { label: "Demandes", href: "/portal/requests" },
            { label: ticket.title },
          ]}
        />
      </div>

      {/* Header */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">{ticket.title}</h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} type="status" />
              <StatusBadge status={ticket.priority} type="priority" />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
                  SLA dépassé
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {ticket.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-4">
          <div>
            <span className="font-medium text-foreground">Créée par :</span>{" "}
            {ticket.createdBy.name}
          </div>
          <div>
            <span className="font-medium text-foreground">Date :</span>{" "}
            {format(ticket.createdAt, "d MMMM yyyy à HH:mm", { locale: fr })}
          </div>
          {ticket.slaDueAt && (
            <div>
              <span className="font-medium text-foreground">Échéance SLA :</span>{" "}
              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                {format(ticket.slaDueAt, "d MMMM yyyy", { locale: fr })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold">Historique</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{ticket.events.length} événement(s)</p>
        </div>
        <div className="p-4 space-y-0">
          {ticket.events.map((event, index) => {
            let payload: Record<string, string> = {};
            try {
              payload = JSON.parse(event.payload);
            } catch {}

            return (
              <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < ticket.events.length - 1 && (
                  <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                )}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                  {eventIcons[event.type] || <div className="h-2 w-2 rounded-full bg-muted-foreground" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium">{eventLabels[event.type] || event.type}</p>
                  {event.type === "status_change" && payload.from && payload.to && (
                    <p className="text-sm text-muted-foreground">
                      {payload.from} → {payload.to}
                    </p>
                  )}
                  {event.type === "comment" && payload.body && (
                    <p className="mt-1 rounded-md bg-muted p-3 text-sm">{payload.body}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {format(event.createdAt, "d MMM yyyy à HH:mm", { locale: fr })}
                    {event.actor && ` · ${event.actor.name}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
