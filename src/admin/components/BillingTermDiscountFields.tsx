import {
  BILLING_TERM_KEYS,
  BILLING_TERM_LABELS,
  type BillingTermKey,
} from "@/admin/lib/billingTermDiscounts";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";

type BillingTermDiscountFieldsProps = {
  values: Record<BillingTermKey, string>;
  onChange: (key: BillingTermKey, value: string) => void;
  idPrefix?: string;
};

export default function BillingTermDiscountFields({
  values,
  onChange,
  idPrefix = "plan-discount",
}: BillingTermDiscountFieldsProps) {
  return (
    <div className="space-y-2">
      <Label>Diskon per term billing (%)</Label>
      <div className="grid grid-cols-2 gap-3">
        {BILLING_TERM_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`${idPrefix}-${key}`} className="text-xs text-muted-foreground">
              {BILLING_TERM_LABELS[key]}
            </Label>
            <Input
              id={`${idPrefix}-${key}`}
              inputMode="decimal"
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder="Kosongkan jika tidak ada"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
