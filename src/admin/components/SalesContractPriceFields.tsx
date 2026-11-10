import { formatPackagePriceInput } from "@/admin/lib/salesContractPackage";
import { Checkbox } from "@/share/ui/checkbox";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";

type SalesContractPriceFieldsProps = {
  idPrefix: string;
  monthlyPriceInput: string;
  onMonthlyPriceInput: (value: string) => void;
  ppnIncluded: boolean;
  onPpnIncluded: (value: boolean) => void;
  error: string | null;
  previewText: string | null;
  previewError: string | null;
};

export default function SalesContractPriceFields({
  monthlyPriceInput,
  onMonthlyPriceInput,
  ppnIncluded,
  onPpnIncluded,
  error,
  previewText,
  previewError,
  idPrefix,
}: SalesContractPriceFieldsProps) {
  return (
    <div className="space-y-3 rounded-md border p-3">
      <p className="text-sm font-medium">Harga paket</p>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-package-price`}>Harga paket per bulan</Label>
        <Input
          id={`${idPrefix}-package-price`}
          inputMode="numeric"
          placeholder="Contoh: 2.000.000"
          value={formatPackagePriceInput(monthlyPriceInput)}
          onChange={(event) => onMonthlyPriceInput(formatPackagePriceInput(event.target.value))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={ppnIncluded} onCheckedChange={(checked) => onPpnIncluded(checked === true)} />
        Harga sudah termasuk PPN
      </label>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {previewText ? <p className="text-xs text-muted-foreground">{previewText}</p> : null}
      {previewError ? <p className="text-xs text-destructive">{previewError}</p> : null}
    </div>
  );
}
