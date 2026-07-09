import PlansPricingTable from "@/admin/components/PlansPricingTable";
import AddOnsPricingTable from "@/admin/components/AddOnsPricingTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/share/ui/tabs";

export default function AdminPricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-sm text-muted-foreground">
          Kelola harga plan dan add-on global. Perubahan berlaku langsung untuk checkout dan
          perpanjangan di office.
        </p>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          <PlansPricingTable />
        </TabsContent>
        <TabsContent value="add-ons" className="mt-4">
          <AddOnsPricingTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
