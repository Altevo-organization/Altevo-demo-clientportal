import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default async function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session, account } = sessionData;

  const thread = await prisma.messageThread.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      participants: {
        include: { clientAccount: { select: { id: true, name: true } } },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (!thread) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="shrink-0">
        <Breadcrumbs
          items={[
            { label: "Portail", href: "/portal" },
            { label: "Messages", href: "/portal/messages" },
            { label: thread.subject },
          ]}
        />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{thread.subject}</h1>
          <div className="flex -space-x-2">
            {thread.participants.map((p) => (
              <Avatar
                key={p.id}
                name={p.clientAccount.name}
                size="sm"
                className="ring-2 ring-background"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-6 space-y-4">
        {thread.messages.map((message) => {
          const isOwn = message.sender.id === account.id;
          return (
            <div
              key={message.id}
              className={cn("flex gap-3", isOwn && "flex-row-reverse")}
            >
              <Avatar name={message.sender.name} size="sm" className="shrink-0 mt-1" />
              <div className={cn("max-w-[70%]", isOwn ? "text-right" : "")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{message.sender.name}</span>
                  <time className="text-xs text-muted-foreground">
                    {format(message.createdAt, "d MMM, HH:mm", { locale: fr })}
                  </time>
                </div>
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                    isOwn
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  {message.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input (mock) */}
      <div className="shrink-0 mt-4 flex gap-2 rounded-lg border bg-card p-2">
        <input
          type="text"
          placeholder="Écrire un message..."
          className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
          readOnly
        />
        <button className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors cursor-pointer">
          Envoyer
        </button>
      </div>
    </div>
  );
}
