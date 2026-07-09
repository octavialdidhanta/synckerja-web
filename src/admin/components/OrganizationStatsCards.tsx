import { useAdminOrganizationsSummary } from "@/admin/hooks/useAdminOrganizationsSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";

function StatCard({
  title,
  value,
  description,
  accentClass,
}: {
  title: string;
  value: number | string;
  description: string;
  accentClass: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold tabular-nums ${accentClass}`}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function OrganizationStatsCards() {
  const { data, isLoading, error } = useAdminOrganizationsSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Gagal memuat ringkasan organizations"}
      </p>
    );
  }

  const summary = data ?? { total_count: 0, active_count: 0, trial_count: 0, expired_count: 0 };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Organizations"
        value={summary.total_count}
        description="Semua tenant terdaftar"
        accentClass="text-foreground"
      />
      <StatCard
        title="Active"
        value={summary.active_count}
        description="Subscription masih berlaku"
        accentClass="text-emerald-600"
      />
      <StatCard
        title="Trial"
        value={summary.trial_count}
        description="Masih dalam masa trial"
        accentClass="text-blue-600"
      />
      <StatCard
        title="Expired"
        value={summary.expired_count}
        description="Subscription sudah berakhir"
        accentClass="text-destructive"
      />
    </div>
  );
}
