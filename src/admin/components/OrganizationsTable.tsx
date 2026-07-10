import { useEffect, useState } from "react";
import EditSubscriptionSheet from "@/admin/components/EditSubscriptionSheet";
import { useAdminOrganizations } from "@/admin/hooks/useAdminOrganizations";
import type { AdminOrganizationRow, OrganizationSubscriptionFilter } from "@/admin/types/organization";
import { cn } from "@/home/lib/utils";
import { Badge } from "@/share/ui/badge";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/share/ui/card";
import { Input } from "@/share/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/share/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/share/ui/tabs";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEndDate(row: AdminOrganizationRow) {
  return formatDate(row.is_trial ? row.trial_end_date : row.subscription_end_date);
}

function TenantTypeBadge({ selfServiceEnabled }: { selfServiceEnabled: boolean }) {
  return selfServiceEnabled ? (
    <Badge className="border-transparent bg-blue-100 text-blue-800">Mandiri</Badge>
  ) : (
    <Badge className="border-transparent bg-amber-100 text-amber-900">Sales</Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "active"
      ? "border-transparent bg-emerald-100 text-emerald-800"
      : status === "trial"
        ? "border-transparent bg-blue-100 text-blue-800"
        : status === "expired"
          ? "border-transparent bg-destructive/15 text-destructive"
          : "border-transparent bg-muted text-muted-foreground";

  return <Badge className={cn(className)}>{status}</Badge>;
}

export default function OrganizationsTable() {
  const [filter, setFilter] = useState<OrganizationSubscriptionFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editRow, setEditRow] = useState<AdminOrganizationRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error, isFetching } = useAdminOrganizations(filter, debouncedSearch);
  const rows = data ?? [];

  const openEditSheet = (row: AdminOrganizationRow) => {
    setEditRow(row);
    setSheetOpen(true);
  };

  return (
    <>
    <Card id="organizations">
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>Daftar tenant dan pengaturan subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as OrganizationSubscriptionFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input
            placeholder="Cari nama perusahaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Memuat data...</p>}
        {error && (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Gagal memuat organizations"}
          </p>
        )}

        {!isLoading && !error && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Tidak ada tenant untuk filter ini.</p>
        )}

        {!isLoading && !error && rows.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Berakhir</TableHead>
                  <TableHead className="text-right">Anggota</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="w-[80px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.organization_id}>
                    <TableCell className="font-medium">{row.company_name}</TableCell>
                    <TableCell>{row.email ?? "—"}</TableCell>
                    <TableCell>{row.plan_name ?? "—"}</TableCell>
                    <TableCell>
                      <TenantTypeBadge selfServiceEnabled={row.subscription_self_service_enabled} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.effective_status} />
                    </TableCell>
                    <TableCell>{row.is_trial ? "Ya" : "Tidak"}</TableCell>
                    <TableCell>{formatEndDate(row)}</TableCell>
                    <TableCell className="text-right">{row.member_count ?? "—"}</TableCell>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openEditSheet(row)}>
                        Atur
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {isFetching && !isLoading && (
          <p className="text-xs text-muted-foreground">Memperbarui...</p>
        )}
      </CardContent>
    </Card>

    <EditSubscriptionSheet
      row={editRow}
      open={sheetOpen}
      onOpenChange={(open) => {
        setSheetOpen(open);
        if (!open) setEditRow(null);
      }}
    />
    </>
  );
}
