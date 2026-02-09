import { getSessionWithAccount } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Receipt, BarChart3, File, Download, Eye, Search } from "lucide-react";

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "info" | "warning" | "success" }> = {
  contract: { label: "Contrat", icon: <FileText className="h-4 w-4" />, variant: "info" },
  invoice: { label: "Facture", icon: <Receipt className="h-4 w-4" />, variant: "warning" },
  report: { label: "Rapport", icon: <BarChart3 className="h-4 w-4" />, variant: "success" },
  general: { label: "Général", icon: <File className="h-4 w-4" />, variant: "default" },
};

export default async function DocumentsPage() {
  const sessionData = await getSessionWithAccount();
  if (!sessionData) redirect("/login");

  const { session } = sessionData;

  const documents = await prisma.document.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  const categoryStats = documents.reduce(
    (acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Portail", href: "/portal" }, { label: "Documents" }]} />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Consultez et téléchargez vos documents en toute sécurité
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Tous</span>
          <span className="text-muted-foreground">({documents.length})</span>
        </div>
        {Object.entries(categoryConfig).map(([key, config]) => (
          categoryStats[key] ? (
            <div key={key} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-card transition-colors cursor-pointer">
              {config.icon}
              <span>{config.label}</span>
              <span>({categoryStats[key]})</span>
            </div>
          ) : null
        ))}
      </div>

      {/* Search bar mock */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un document..."
          className="w-full rounded-lg border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          readOnly
        />
      </div>

      {/* Documents table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Document
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Catégorie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Taille
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Ajouté par
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {documents.map((doc) => {
              const cat = categoryConfig[doc.category] || categoryConfig.general;
              return (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2 shrink-0">
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.variant}>{cat.label}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{formatFileSize(doc.size)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{doc.uploadedBy?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(doc.createdAt, "d MMM yyyy", { locale: fr })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer" title="Aperçu">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer" title="Télécharger">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <p className="text-xs text-muted-foreground">
        {documents.length} document(s) · Tous les téléchargements sont journalisés pour des raisons de sécurité
      </p>
    </div>
  );
}
