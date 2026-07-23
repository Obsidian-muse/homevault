import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentAssetsTable } from "@/components/dashboard/recent-assets-table";
import { Package, ShieldCheck, ShieldAlert, Wrench } from "lucide-react";

export const metadata = { title: "Dashboard | HomeVault" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">A snapshot of everything in your vault.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Assets"
          value={stats.totalAssets}
          icon={Package}
          hint="Across all homes and rooms"
          tone="default"
        />
        <StatCard
          label="Active Warranties"
          value={stats.activeWarranties}
          icon={ShieldCheck}
          hint="Currently in effect"
          tone="success"
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          icon={ShieldAlert}
          hint="Within the next 30 days"
          tone="warning"
        />
        <StatCard
          label="Maintenance Due"
          value={stats.maintenanceDue}
          icon={Wrench}
          hint="Due or overdue this week"
          tone="destructive"
        />
      </div>

      <RecentAssetsTable assets={stats.recentAssets} />
    </div>
  );
}
