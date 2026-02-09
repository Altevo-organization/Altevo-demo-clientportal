import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function MessagesPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session } = sessionData;

  const threads = await prisma.messageThread.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: { clientAccount: { select: { name: true } } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
      _count: { select: { messages: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Messages" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Échangez en toute sécurité avec votre équipe dédiée
        </p>
      </div>

      {/* Thread list */}
      <div className="space-y-3">
        {threads.map((thread) => {
          const lastMessage = thread.messages[0];
          const participants = thread.participants.map((p) => p.clientAccount.name);

          return (
            <Link
              key={thread.id}
              href={`/portal/messages/${thread.id}`}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-gray-50/50"
            >
              <div className="rounded-full bg-muted p-2.5">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold truncate">{thread.subject}</p>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(thread.updatedAt, "d MMM", { locale: fr })}
                  </time>
                </div>
                {lastMessage && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">
                    <span className="font-medium">{lastMessage.sender.name}:</span>{" "}
                    {lastMessage.body}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex -space-x-1.5">
                    {participants.slice(0, 3).map((name) => (
                      <Avatar key={name} name={name} size="sm" className="h-5 w-5 text-[9px] ring-2 ring-card" />
                    ))}
                  </div>
                  <span>{thread._count.messages} message(s)</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          );
        })}

        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">Aucune conversation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vos échanges avec votre équipe apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
