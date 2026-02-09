import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge } from "@/components/portal/status-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TicketCheck, Clock, AlertTriangle, CheckCircle2, Pause, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="h-4 w-4 text-blue-500" />,
  in_progress: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  waiting: <Pause className="h-4 w-4 text-purple-500" />,
  resolved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  closed: <CheckCircle2 className="h-4 w-4 text-gray-400" />,
};

export default async function RequestsPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session } = sessionData;

  const tickets = await prisma.requestTicket.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { events: true } },
    },
  });

  const statusCounts = tickets.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Demandes" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Demandes</h1>
        <p className="text-muted-foreground mt-1">
          Suivez l&apos;avancement de vos demandes et tickets
        </p>
      </div>

      {/* Status overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { key: "open", label: "Ouvertes", color: "border-blue-200 bg-blue-50/50" },
          { key: "in_progress", label: "En cours", color: "border-amber-200 bg-amber-50/50" },
          { key: "waiting", label: "En attente", color: "border-purple-200 bg-purple-50/50" },
          { key: "resolved", label: "Résolues", color: "border-green-200 bg-green-50/50" },
          { key: "closed", label: "Fermées", color: "border-gray-200 bg-gray-50/50" },
        ].map((s) => (
          <div key={s.key} className={`rounded-lg border p-3 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{statusCounts[s.key] || 0}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {tickets.map((ticket) => {
          const isOverdue = ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && ticket.status !== "resolved" && ticket.status !== "closed";
          return (
            <Link
              key={ticket.id}
              href={`/portal/requests/${ticket.id}`}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-gray-50/50"
            >
              <div className="shrink-0">{statusIcons[ticket.status]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{ticket.title}</p>
                  {isOverdue && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                      SLA dépassé
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {ticket.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Par {ticket.createdBy.name}</span>
                  <span>·</span>
                  <span>{format(ticket.createdAt, "d MMM yyyy", { locale: fr })}</span>
                  <span>·</span>
                  <span>{ticket._count.events} événement(s)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={ticket.priority} type="priority" />
                <StatusBadge status={ticket.status} type="status" />
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {tickets.length} demande(s) au total
      </p>
    </div>
  );
}
