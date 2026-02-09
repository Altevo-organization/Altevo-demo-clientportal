import { redirect } from "next/navigation";
import { getSessionWithAccount } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSessionWithAccount();

  if (!sessionData) {
    redirect("/login");
  }

  const { account } = sessionData;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={account.name}
          userRole={account.role}
          organizationName={account.organization.name}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
